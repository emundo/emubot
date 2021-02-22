import { TextRequest } from '../../model/TextRequest';
import { NlpResponse } from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getConfig } from '../../../core/getConfig';
import { toNlpTextResponse } from './responseConverters';
import { SnipsResponse } from '../model/SnipsTextResponse';
import { postRequest } from '../../../chat_adapter/utils';
import { OptionsWithUrl } from '../../../core/utils/responseUtils';

export async function sendTextRequest(
    textRequest: TextRequest,
    agentName: string | number,
): Promise<NlpResponse> {
    const requestConfig = createRequestConfiguration(textRequest, agentName);
    try {
        const resp: SnipsResponse = await postRequest(requestConfig);

        return toNlpTextResponse(
            resp,
            textRequest.message,
            agentName.toString(),
        );
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.sendTextRequest}${err}`);
        throw err;
    }
}

function createRequestConfiguration(
    textRequest: TextRequest,
    agentName: string | number,
): OptionsWithUrl {
    return {
        body: {
            message_id: textRequest.internalUserId,
            text: textRequest.message,
            token: getConfig().platform.nlp.agents[agentName].token,
        },
        options: {

            headers: {
                'Content-Type': 'application/json',
            },
            json: true,
        },
        url: `${getConfig().platform.nlp.agents[agentName].url}/parse`,
    };
}
