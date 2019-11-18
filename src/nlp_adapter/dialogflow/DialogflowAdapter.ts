import { NlpAdapter } from '../INlpAdapter';
import { TextRequest } from '../model/TextRequest';
import {
    deleteAllContexts,
    deleteSelectedContexts,
} from './communication/deleteContexts';
import { postContexts } from './communication/postContextsFromServer';
import { sendTextRequest } from './communication/sendTextRequest';
import { NlpResponse, NlpStatus } from '../model/NlpAdapterResponse';
import { getConfig } from '../../core/getConfig';

/**
 * WARNING: The Dialogflow API version 1 will be deprecated soon. Migrate to version 2 and use the `DialogflowV2Adapter`.
 * Adapter for the [Dialogflow](https://dialogflow.com/) framework. This is an adapter for the Dialogflow API version 1.
 * Version 1 uses client and developer tokens to authenticate a user.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class DialogflowAdapter implements NlpAdapter {
    public lifespanInMinutes = 2;

    public deleteAllContexts(
        this: DialogflowAdapter,
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus> {
        return deleteAllContexts(
            internalUserId,
            getConfig().platform.nlp.agents[agentName].token,
        );
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

    public postContexts(
        this: DialogflowAdapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus> {
        return postContexts(
            internalUserId,
            contexts,
            getConfig().platform.nlp.agents[agentName].token,
        );
    }

    public sendSingleTextRequest(
        this: DialogflowAdapter,
        message: TextRequest,
        agentName: string,
    ): Promise<NlpResponse> {
        return sendTextRequest(
            message,
            agentName,
            getConfig().platform.nlp.agents[agentName].token,
            getConfig().platform.nlp.agents[agentName].url,
        );
    }
}
