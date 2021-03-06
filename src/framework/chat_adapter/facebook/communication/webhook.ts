import * as express from 'express';
import { Server } from 'http';
import { logger } from '../../../logger';
import {
    FacebookPostRequest,
    FacebookMessaging,
} from '../model/FacebookPostRequest';
import { FacebookChatConfig } from '../facebookConfig';
import { Response } from '../../../core/model/Response';
import { createResponse } from '../../../core/utils/responseUtils';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { ChatAdapterResponse } from '../../ChatAdapterResponse';
import * as lodash from 'lodash';
import { getConfig } from '../../../core/getConfig';
import { sendMultipleResponses } from './sendResponses';
import { MESSAGES } from '../../../constants/messages';
import { createHmac } from 'crypto';

type ExtendedExpressRequest = express.Request & { rawBody: string };

/**
 * Initializes the webhook and awaits new messages. If a message is received, `handleRequest` is triggered, which converts
 * the incoming message into a generalized format and passes it into the core for further processing steps.
 */
export function initWebhook(
    server: Server,
    app: express.Express,
    handleRequest: (
        request: FacebookMessaging,
        messengerUserId: string,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): void {
    const WEBHOOK_PATH = getConfig().platform.chat.webhook_path;
    const WEBHOOK_VERIFICATION = getConfig().platform.chat.webhook_path;
    const PORT = getConfig().server.port;

    // Check if all required tokens are set.
    const facebookConfig = (getConfig().platform
        .chat as unknown) as FacebookChatConfig;

    if (!facebookConfig.appSecret) {
        logger.error(LOG_MESSAGES.chat.missingAppSecret);
        process.exit(1);
    }
    if (!facebookConfig.pageAccessToken) {
        logger.error(LOG_MESSAGES.chat.missingPageAccessToken);
        process.exit(1);
    }
    if (!facebookConfig.verifyToken) {
        logger.error(LOG_MESSAGES.chat.missingVerifyToken);
        process.exit(1);
    }

    server.listen(PORT, () =>
        logger.verbose(
            `${LOG_MESSAGES.chat.facebook}
            ${LOG_MESSAGES.chat.webhookListening} ${PORT}!`,
        ),
    );

    /**
     * Upon setting up the webhook, Facebook sends a GET-request to verify the endpoint URL.
     * Return status code `200` if the `verify_token` is set correctly in your app and in this framework.
     */
    app.get(WEBHOOK_VERIFICATION, (req, res) => {
        verifyAuthentication(req, res);
    });

    /**
     *  Handles incoming POST messages which include _normal_ text messages.
     */
    app.post(WEBHOOK_PATH, (req, res) => {
        logger.debug(LOG_MESSAGES.chat.incomingPostRequest);
        const verified: boolean = validatePayload(
            req as ExtendedExpressRequest,
        );
        if (!verified && !process.env.test) {
            res.sendStatus(400);
        }

        const body: FacebookPostRequest = req.body;
        // Checks if this is an event from a page subscription
        if (body.object === 'page') {
            logger.debug(LOG_MESSAGES.chat.pageSubscriptionEvent);
            logger.silly(JSON.stringify(body));
            // We immediately return a '200 OK' response to all incoming requests to fulfull the express request.
            // Answers will be sent independently from the incoming message.
            res.status(200).send('EVENT_RECEIVED');

            // Message handling inside the core happens here.
            const returnedPromises = handleRequests(body, handleRequest);

            Promise.all(returnedPromises).then(returnedResponses =>
                handleResponses(returnedResponses),
            );
        } else {
            logger.debug(LOG_MESSAGES.chat.noPageSubscriptionEvent);
            res.sendStatus(404);
        }
    });
}

/**
 * Validate message according to https://developers.facebook.com/docs/messenger-platform/webhook/#security.
 * Used to verify the integrity and origin of the incoming message.
 */
function validatePayload(req: ExtendedExpressRequest): boolean {
    const hmac = createHmac('sha1', getConfig().platform.chat.appSecret);
    hmac.update(req.rawBody);

    return req.headers['x-hub-signature'] === `sha1=${hmac.digest('hex')}`;
}

/**
 * Verifies an incoming webhook authentication from Facebook.
 */
function verifyAuthentication(
    req: express.Request,
    res: express.Response,
): void {
    logger.debug(LOG_MESSAGES.chat.incomingGetRequest);
    const authenticated = isWebhookAuthenticated(req);

    if (authenticated) {
        logger.info(LOG_MESSAGES.chat.webhookVerified);
        res.status(200).send(req.query['hub.challenge']);
    } else {
        logger.info(LOG_MESSAGES.chat.webhookNotVerfied);
        res.sendStatus(401);
    }
}

function isWebhookAuthenticated(req: express.Request): boolean {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const facebookConfig = (getConfig().platform
        .chat as unknown) as FacebookChatConfig;

    return mode === 'subscribe' && token === facebookConfig.verifyToken;
}

/**
 * Iterates over each incoming entry. There may be multiple entries if batched.
 */
function handleRequests(
    body: FacebookPostRequest,
    handleRequest: (
        request: FacebookMessaging,
        messengerUserId: string,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): Promise<Response<ChatAdapterResponse[]>>[] {
    return lodash.flatMap(body.entry, entry => {
        return entry.messaging.map(async messaging => {
            try {
                return await handleRequest(messaging, messaging.sender.id);
            } catch (error) {
                logger.error(error);

                return createResponse(
                    [
                        {
                            Message: {
                                text: MESSAGES.error.general,
                                type: 'text',
                            },
                            messengerUserId: messaging.sender.id,
                        } as ChatAdapterResponse,
                    ],
                    500,
                    messaging.sender.id,
                );
            }
        });
    });
}

/**
 * Sends responses back to the user.
 */
function handleResponses(
    returnedResponses: Response<ChatAdapterResponse[]>[],
): void {
    const allResponsesReturnedToUser = returnedResponses
        .map(response =>
            response.kind === 'Response' ? response.payload : undefined,
        )
        .filter(response => response !== undefined) as ChatAdapterResponse[][];
    allResponsesReturnedToUser.map(responses =>
        sendMultipleResponses(responses, responses[0].messengerUserId),
    );
}
