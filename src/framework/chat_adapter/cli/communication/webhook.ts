import * as express from 'express';
import * as http from 'http';
import { json } from 'body-parser';
import * as cors from 'cors';
import { logger } from '../../../logger';
import {
    CliClientRequest,
    CliClientInitialMessage,
} from '../model/CliClientRequest';
import { Response } from '../../../core/model/Response';
import { ChatAdapterResponse } from '../../ChatAdapterResponse';
import { convertIntoCliClientResponse } from './convertCliClientResponse';
import { getConfig } from '../../../core/getConfig';
import { LOG_MESSAGES } from '../../../constants/logMessages';

/**
 * This function is used to setup a webhook that is compatible to the `CliClient`.
 * GET /WEBHOOK_PATH/hello: Used to tell the framework about the connection of a new user. This route generates a new
 *                          ID for that user and answers the user with the id.
 * POST /WEBHOOK_PATH     : This route handles text requests. Requests on this route are run through the processing
 *                          pipeline of the frameowrk and will end be sent to the NLP service through the `NLPAdapter`
 *                          depending on the type of message and configuration of the `Interceptor`s.
 *
 * @param handleRequest function that describes how the webhook should handle an incoming request.
 */
// tslint:disable-next-line: max-func-body-length
export function initWebhook(
    handleRequest: (
        request: CliClientRequest,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): void {
    const config = getConfig();
    const WEBHOOK_PATH = config?.platform.chat.webhook_path ?? '/webhook';
    const PORT = config?.server.port ?? 4000;

    logger.info(`Init webhook for CLI chat ...`);

    const app = express().use(json());
    app.use(cors({ origin: '*' }));

    const server = http.createServer(app);

    // Handle incoming message.
    app.post(WEBHOOK_PATH, async (req, res) => {
        logger.debug(LOG_MESSAGES.chat.incomingPostRequest);
        const body: CliClientRequest = req.body;

        try {
            const responses: Response<ChatAdapterResponse[]> = await handleRequest(
                body,
            );
            res.statusCode = responses.statusCode;

            if (responses.kind === 'NoResponse') {
                res.sendStatus(responses.statusCode);
            } else {
                const convertedResponses = responses.payload.map(payload =>
                    convertIntoCliClientResponse(payload),
                );

                res.send(convertedResponses);
            }
        } catch (errorText) {
            res.statusCode = 400;
            res.send(errorText);
        }
    });

    app.get(`${WEBHOOK_PATH}/hello`, async (_, res) => {
        const confirmedId: string = await handleRequest({
            type: 'initial',
        } as CliClientInitialMessage).then(response => response.userId);
        res.send({ id: confirmedId });
    });

    server.listen(PORT, () =>
        logger.verbose(`${LOG_MESSAGES.chat.webhookListening} ${PORT}`),
    );
}
