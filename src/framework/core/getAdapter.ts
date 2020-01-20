import { getConfig } from './getConfig';
import { NlpAdapter } from '../nlp_adapter/INlpAdapter';
import { ChatAdapter } from '../chat_adapter/IChatAdapter';

export type Adapter = {
    nlp: NlpAdapter;
    chat: ChatAdapter;
};

/**
 * Convenience object to provide access to the NlpAdapter and ChatAdapter.
 */
export const adapter: Adapter = {
    get nlp(): NlpAdapter {
        return new (getConfig().platform.nlp.constructor)();
    },
    get chat(): ChatAdapter {
        return new (getConfig().platform.chat.constructor)();
    },
};
