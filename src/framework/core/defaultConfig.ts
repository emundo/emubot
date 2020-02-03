import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';
import {
    ChatAdapterResponse,
    ChatAdapterTextMessage,
} from '../chat_adapter/ChatAdapterResponse';
import { Response } from './model/Response';

/**
 * Default configuration which is set in the absence of any other configuration. In this case the framework will
 * not run the message through the core pipeline since that would require a valid NLP configuration. The framework
 * will start with the CLI adapter.
 */
export async function dummyHandleMessage(
    _: ChatAdapterRequest,
    userId: string,
): Promise<Response<ChatAdapterResponse[]>> {
    const text: ChatAdapterTextMessage = {
        type: 'text',
        text: `Welcome to emubot! If you want to test the core functionality you will
               need to provide a valid configuration file!`,
    };
    const resp: ChatAdapterResponse = {
        Message: text,
        messengerUserId: userId,
    };

    return {
        payload: [resp],
        kind: 'Response',
        statusCode: 200,
        userId: userId,
    };
}
