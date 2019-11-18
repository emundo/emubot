import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';
import { adapter } from './getAdapter';

/**
 * Entry point into the framework, starts the server and the message handling.
 * IMPORTANT: Make sure that you have already set the config (see `../main.ts`)
 * More information can be found at [here]{@link ../../_build/html/configuration.html}.
 */
export async function initCore(): Promise<void> {
    return adapter.chat.init(
        async (message: ChatAdapterRequest, messengerUserId: string) => {
            const handleReceivedMessage = await import(
                './handleReceivedMessage'
            );

            return handleReceivedMessage.handleReceivedMessageInCore(
                message,
                messengerUserId,
            );
        },
    );
}
