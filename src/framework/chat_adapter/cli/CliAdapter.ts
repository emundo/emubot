import { ChatAdapter } from '../IChatAdapter';
import { ChatAdapterRequest } from '../ChatAdapterRequest';
import { ChatAdapterResponse } from '../ChatAdapterResponse';
import { Response } from '../../core/model/Response';
import { initWebhook } from './communication/webhook';
import { convertIntoChatAdapterRequest } from './communication/convertCliClientRequest';
import { CliClientRequest } from './model/CliClientRequest';

/**
 * For more information regarding the setup:
 * see [CLI setup]{@link ../../_build/html/chat_adapter/cli_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class CliAdapter implements ChatAdapter {
    contactClient(_: ChatAdapterResponse): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void> {
        initWebhook(async (message: CliClientRequest) => {
            return handleRequest(
                convertIntoChatAdapterRequest(message),
                message.id,
            );
        });
    }
}
