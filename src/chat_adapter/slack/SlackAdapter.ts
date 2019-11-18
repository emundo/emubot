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

export class SlackAdapter implements ChatAdapter {
    public async init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void> {
        await initWebhook(async (message: SlackRequest) => {
            return handleRequest(
                convertIntoChatAdapterRequest(message),
                message.user,
            );
        });
    }

    async contactClient(response: ChatAdapterResponse): Promise<void> {
        const channel: string = await openChannel(response.messengerUserId);
        const resp: SlackResponse = convertToSlackResponse(
            response,
            response.messengerUserId,
            channel,
        );

        await sendTextResponse(resp);
    }
}
