import { NlpAdapter } from '../INlpAdapter';
import { TextRequest } from '../model/TextRequest';
import { NlpStatus, NlpResponse } from '../model/NlpAdapterResponse';
import { sendTextRequest } from './communication/sendTextRequest';
import {
    deleteAllContexts,
    deleteSelectedContexts,
} from '../communication/deleteContexts';
import { postContexts } from '../communication/postContexts';

/**
 * Adapter for the [Rasa NLU](https://rasa.com/docs/rasa/) framework.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class RasaAdapter implements NlpAdapter {
    // Lifespan not required. Rasa does not support the same notion of contexts as other NLP services
    public lifespanInMinutes = 0;

    public async deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus> {
        return deleteAllContexts(internalUserId, agentName);
    }

    public deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextToDelete: string[],
    ): Promise<NlpStatus> {
        return deleteSelectedContexts(
            internalUserId,
            agentName,
            contextToDelete,
        );
    }

    public async postContexts(
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus> {
        return postContexts(internalUserId, agentName, contexts);
    }

    public async sendSingleTextRequest(
        this: RasaAdapter,
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse> {
        return sendTextRequest(textRequest, agentName);
    }
}
