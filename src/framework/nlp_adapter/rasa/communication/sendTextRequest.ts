import * as request from 'request-promise-native';
import { TextRequest } from '../../model/TextRequest';
import { NlpResponse } from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getConfig } from '../../../core/getConfig';
import { toNlpTextResponse } from './responseConverters';
import { RasaTextResponse, RasaParseResponse } from '../model/RasaResponse';

export async function sendTextRequest(
    textRequest: TextRequest,
    agentName: string,
): Promise<NlpResponse> {
    const requestText = createRequestConfigurationTextMessage(
        textRequest,
        agentName,
    );

    const requestConfig = createRequestConfiguration(textRequest, agentName);

    try {
        const responseText: RasaTextResponse[] = await request.post(
            requestText,
        );
        const resp: RasaParseResponse = await request.post(requestConfig);

        return toNlpTextResponse(
            resp,
            textRequest.message,
            responseText,
            agentName.toString(),
        );
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.sendTextRequest}${err}`);
        throw err;
    }
}

function createRequestConfigurationTextMessage(
    textRequest: TextRequest,
    agentName: string,
): request.OptionsWithUrl {
    return {
        body: {
            message: textRequest.message,
            message_id: textRequest.internalUserId,
            token: getConfig().platform.nlp.agents[agentName].token,
        },
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        url: `${
            getConfig().platform.nlp.agents[agentName].url
        }/webhooks/rest/webhook`,
    };
}

function createRequestConfiguration(
    textRequest: TextRequest,
    agentName: string,
): request.OptionsWithUrl {
    return {
        body: {
            message_id: textRequest.internalUserId,
            sender: 'user',
            text: textRequest.message,
            token: getConfig().platform.nlp.agents[agentName].token,
        },
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        url: `${getConfig().platform.nlp.agents[agentName].url}/model/parse`,
    };
}
