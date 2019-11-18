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
import { DialogflowConfig } from './dialogflowConfig';
/**
 * Adapter for the [Dialogflow](https://dialogflow.com/) framework. This is an adapter for Dialogflow API version 2.
 * Version 2 uses JSONs provided through Google Cloud Projects to authenticate the requests and has an updated response
 * format.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class DialogflowV2Adapter implements NlpAdapter {
    public lifespanInMinutes = 2;

    public deleteAllContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus> {
        const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;

        return deleteAllContexts(
            internalUserId,
            dialogflowConfig.agents[agentName].project_id,
            dialogflowConfig.agents[agentName].token,
        );
    }

    public deleteSelectedContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus> {
        const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;

        return deleteSelectedContexts(
            internalUserId,
            dialogflowConfig.agents[agentName].project_id,
            dialogflowConfig.agents[agentName].token,
            contexts,
        );
    }

    public postContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus> {
        const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;

        return postContexts(
            internalUserId,
            dialogflowConfig.agents[agentName],
            contexts,
        );
    }

    public sendSingleTextRequest(
        this: DialogflowV2Adapter,
        message: TextRequest,
        agentName: string,
    ): Promise<NlpResponse> {
        const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;

        return sendTextRequest(
            message,
            dialogflowConfig.agents[agentName].project_id,
            dialogflowConfig.agents[agentName].token,
            agentName,
        );
    }
}
