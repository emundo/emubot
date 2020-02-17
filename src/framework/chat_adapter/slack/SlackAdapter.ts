import SlackEventAdapter from '@slack/events-api/dist/adapter';
import { createEventAdapter } from '@slack/events-api';
import { ChatAdapter } from '../IChatAdapter';
import { ChatAdapterRequest } from '../ChatAdapterRequest';
import { ChatAdapterResponse } from '../ChatAdapterResponse';
import { Response } from '../../core/model/Response';
import {
    initWebhook,
    sendTextResponse,
    openChannel,
} from './communication/webhook';
import { convertIntoChatAdapterRequest } from './communication/convertRequest';
import { SlackRequest } from './model/SlackRequest';
import { SlackResponse } from './model/SlackResponse';
import { convertToSlackResponse } from './communication/convertResponse';
import { logger } from '../../logger';
import { LOG_MESSAGES } from '../../constants/logMessages';
import { getConfig } from '../../core/getConfig';

export class SlackAdapter implements ChatAdapter {
    public slackEvents: SlackEventAdapter;

    constructor() {
        const SLACK_SIGNING_SECRET: string = getConfig().platform.chat
            .appSecret;

        this.slackEvents = createEventAdapter(SLACK_SIGNING_SECRET);
    }

    public async init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void> {
        await initWebhook(this.slackEvents, async (message: SlackRequest) => {
            return handleRequest(
                convertIntoChatAdapterRequest(message),
                message.user,
            );
        });
    }

    async deinit(): Promise<void> {
        await this.slackEvents.stop();
    }

    async contactClient(response: ChatAdapterResponse): Promise<void> {
        const channel: string = await openChannel(response.messengerUserId);
        if (channel === '') {
            logger.warn(
                `${LOG_MESSAGES.chat.unknownClient}\n${response.messengerUserId}`,
            );

            return;
        }
        const resp: SlackResponse = convertToSlackResponse(
            response,
            response.messengerUserId,
            channel,
        );

        await sendTextResponse(resp);
    }
}
