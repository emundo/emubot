import { ChatAdapter } from '../IChatAdapter';
import { ChatAdapterResponse } from '../ChatAdapterResponse';
import { initWebhook } from './communication/webhook';
import { ChatAdapterRequest } from '../ChatAdapterRequest';
import { convertFacebookRequest } from './communication/convertRequest';
import { FacebookMessaging } from './model/FacebookPostRequest';
import { Response } from '../../core/model/Response';
import { sendMultipleResponses } from './communication/sendResponses';

/**
 * For more information regarding the setup:
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/facebook_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class FacebookAdapter implements ChatAdapter {
    public async init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void> {
        initWebhook(async (message: FacebookMessaging) => {
            return handleRequest(
                convertFacebookRequest(message),
                message.sender.id,
            );
        });
    }

    public contactClient(response: ChatAdapterResponse): Promise<void> {
        return sendMultipleResponses([response], response.messengerUserId);
    }
}
