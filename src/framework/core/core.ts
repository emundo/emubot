import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';
import { getConfig } from './getConfig';
import { adapter } from './getAdapter';
import { dummyHandleMessage } from './defaultConfig';
import { CliAdapter } from '../chat_adapter/cli/CliAdapter';
import { ChatAdapter } from '../chat_adapter/IChatAdapter';
import { logger } from '../logger';
import { LOG_MESSAGES } from '../constants/logMessages';

/**
 * Entry point into the framework, starts the server and the message handling.
 * IMPORTANT: Make sure that you have already set the config (see `../main.ts`)
 * More information can be found at [here]{@link ../../_build/html/configuration.html}.
 */

let chat: ChatAdapter;
export async function initCore(): Promise<void> {
    if (getConfig() === undefined) {
        logger.warn(LOG_MESSAGES.chat.defaultConfiguration);
        const adapter: CliAdapter = new CliAdapter();

        return adapter.init(dummyHandleMessage);
    }

    chat = adapter.chat;

    return chat.init(
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

export async function deinitCore(): Promise<void> {
    try {
        await chat.deinit();
    } catch (e) {
        logger.error(`${LOG_MESSAGES.core.couldNotStopCore}${e}`);

        return Promise.reject(e);
    }
}
