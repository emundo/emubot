import * as request from 'request-promise-native';
import { TextRequest } from '../../model/TextRequest';
import { NlpResponse } from '../../model/NlpAdapterResponse';
import { toNlpTextResponse } from './responseConverters';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getConfig } from '../../../core/getConfig';

export async function sendTextRequest(
    textRequest: TextRequest,
    agentName: string,
    agentToken: string,
    url: string,
): Promise<NlpResponse> {
    logger.verbose(
        `${LOG_MESSAGES.request.text_request}${JSON.stringify(
            textRequest,
            undefined,
            2,
        )}`,
    );

    try {
        const config = createRequestConfiguration(
            textRequest,
            agentToken,
            url,
            agentName,
        );
        const req = await request.post(config);

        return toNlpTextResponse(req, agentName);
    } catch (error) {
        logger.error(`${LOG_MESSAGES.nlp.sendTextRequest}${error}`);

        return {} as NlpResponse;
    }
}

function createRequestConfiguration(
    textRequest: TextRequest,
    agentToken: string,
    url: string,
    agentName: string,
): request.OptionsWithUrl {
    return {
        body: {
            lang: getConfig().platform.nlp.agents[agentName].languageCode,
            query: textRequest.message,
            sessionId: textRequest.internalUserId,
        },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${agentToken}`,
            'Content-Type': 'application/json',
        },
        json: true,
        url,
    };
}
