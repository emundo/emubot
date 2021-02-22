import { getConfig } from '../../core/getConfig';
import { NlpStatus } from '../model/NlpAdapterResponse';
import { logger } from '../../logger';
import { LOG_MESSAGES } from '../../constants/logMessages';
import { DialogflowConfig } from '../dialogflowV2/dialogflowConfig';
import { postRequest } from '../../chat_adapter/utils';
import { OptionsWithUrl } from '../../core/utils/responseUtils';

/**
 * Posts a list of contexts to the NLP backend. The context system is based on the Dialogflow context system.
 * If the NLP backend that you are using does not use a context system you can just ignore these requests.
 * The request will then be sent to the route `/postContexts` and includes an JSON object with the following data:
 *
 * ```
 * {
 *   lifespan: number,
 *   contexts: string[],
 *   user: string
 * }
 * ```
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentName Used to define the agent whose contexts shall be deleted.
 * @param contexts List of contexts that will be deleted from the conversation.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export async function postContexts(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): Promise<NlpStatus> {
    const config = createPostRequestConfiguration(
        internalUserId,
        agentName,
        contexts,
    );

    return postRequest(config)
        .then()
        .catch(err => {
            logger.error(
                `${LOG_MESSAGES.nlp.unableToAddContexts}${contexts}\n Reason: ${err}`,
            );

            return { success: false };
        });
}

function createPostRequestConfiguration(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): OptionsWithUrl {
    const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;

    return {
        body: {
            contexts,
            lifespan: dialogflowConfig.agents[agentName].defaultLifespan,
            user: internalUserId,
        },
        options: {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${dialogflowConfig.agents[agentName].token}`,
                'Content-Type': 'application/json',
            },
            json: true,
        },
        url: `${dialogflowConfig.agents[agentName].url}/postContexts`,
    };
}
