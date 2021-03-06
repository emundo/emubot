import { TextRequest } from '../../model/TextRequest';
import { NlpResponse } from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import * as dialogflow from '@google-cloud/dialogflow';
import { toNlpTextResponse } from './responseConverters';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getAllContexts } from './getContexts';
import { getConfig } from '../../../core/getConfig';

export async function sendTextRequest(
    textRequest: TextRequest,
    projectId: string,
    agentToken: string,
    agentName: string,
): Promise<NlpResponse> {
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: agentToken,
        projectId,
    });
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        textRequest.internalUserId,
    );

    try {
        const config = createDialogflowRequestConfiguration(
            textRequest,
            sessionPath,
            agentName,
        );
        getAllContexts(agentName, textRequest.internalUserId);
        const resp = await sessionClient.detectIntent(config);
        logger.debug(`DialogflowV2 response: ${JSON.stringify(resp)}`);

        return toNlpTextResponse(resp[0], agentName);
    } catch (error) {
        logger.error(`${LOG_MESSAGES.nlp.sendTextRequest}${error}`);

        return {} as NlpResponse;
    }
}

function createDialogflowRequestConfiguration(
    textRequest: TextRequest,
    sessionPath: string,
    agentName: string,
): dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentRequest {
    return {
        queryInput: {
            text: {
                languageCode: getConfig().platform.nlp.agents[agentName]
                    .languageCode,
                text: textRequest.message,
            },
        },
        session: sessionPath,
    };
}
