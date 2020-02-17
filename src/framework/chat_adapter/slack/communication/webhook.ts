import { post, OptionsWithUrl } from 'request-promise-native';
import { ChatAdapterResponse } from '../../ChatAdapterResponse';
import { SlackRequest, SlackMessage } from '../model/SlackRequest';
import { Response } from '../../../core/model/Response';
import { getConfig } from '../../../core/getConfig';
import { SlackEventAdapter } from '@slack/events-api/dist/adapter';
import { logger } from '../../../logger';
import { convertToSlackResponse } from './convertResponse';
import {
    SlackResponse,
    SlackOpenChannelResponse,
    SlackErrorResponse,
} from '../model/SlackResponse';
import { SlackConfig } from '../slackConfig';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { mapSerialized } from '../../utils';

export async function openChannel(userId: string): Promise<string> {
    const config: OptionsWithUrl = createRequestConfiguration(
        '',
        userId,
        '',
        'im.open',
    );
    const resp: SlackOpenChannelResponse | SlackErrorResponse = await post(
        config,
    ).catch(e => logger.error(e));

    if (!resp.ok) {
        logger.error(
            `Channel with user ${userId} could not be created. Reason: ${resp.error}`,
        );

        return '';
    }

    return resp.channel.id;
}

export async function sendTextResponse(response: SlackResponse): Promise<void> {
    const config = createRequestConfiguration(
        response.text,
        response.user,
        response.channel,
        'chat.postMessage',
    );

    await post(config).catch(e => logger.error(e));
}

export async function initWebhook(
    slackEvents: SlackEventAdapter,
    _handleRequest: (
        request: SlackRequest,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): Promise<void> {
    const PORT: number = getConfig().server.port;

    await slackEvents.start(PORT);
    logger.info(`Server started on port ${PORT}!`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (slackEvents as any).on('message', async (event: SlackMessage) => {
        handleMessage(event, _handleRequest);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (slackEvents as any).on('error', async (event: string) => {
        logger.debug(LOG_MESSAGES.chat.noPageSubscriptionEvent);
        logger.error(logger.error(event));
    });
}

async function handleMessage(
    event: SlackMessage,
    _handleRequest: (
        request: SlackRequest,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): Promise<void> {
    if (event.subtype === 'bot_message') {
        return;
    }
    // Fast response to Slack to assure we will answer.
    const config = createRequestConfiguration(
        '',
        event.user,
        event.channel,
        'chat.postMessage',
    );
    await post(config).catch(e => logger.error(e));
    const responses: Response<ChatAdapterResponse[]> = await _handleRequest(
        event,
    );

    if (responses.kind !== 'NoResponse') {
        const resps = responses.payload.map(r =>
            convertToSlackResponse(r, event.user, event.channel),
        );
        mapSerialized(resps, async (r: SlackResponse) => sendTextResponse(r));
        openChannel(event.user);
    }
}

function createRequestConfiguration(
    text: string,
    user: string,
    channel: string,
    route: string,
): OptionsWithUrl {
    return {
        body: {
            channel,
            text,
            user,
        },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${
                (getConfig().platform.chat as SlackConfig).token
            }`,
            'Content-Type': 'application/json',
        },
        json: true,
        url: `${getConfig().platform.chat.url}${route}`,
    };
}
