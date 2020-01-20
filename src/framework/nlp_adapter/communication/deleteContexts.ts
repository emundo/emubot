import * as request from 'request-promise-native';
import { NlpStatus } from '../model/NlpAdapterResponse';
import { logger } from '../../logger';
import { LOG_MESSAGES } from '../../constants/logMessages';
import { getConfig } from '../..';

/**
 * Deletes all contexts which are currently active for a certain agent. The context system is based on the
 * system used by Dialogflow. If you are using NLP backend that does not use a system like that you can just
 * ignore these requests. The requests will delete on the route `/deleteAllContexts` with the following JSON:
 * ```
 *  {
 *      user: string
 *  }
 * ```
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentName Used to define the agent whose contexts shall be deleted.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export function deleteAllContexts(
    internalUserId: string,
    agentName: string,
): Promise<NlpStatus> {
    const config = createRequestConfigurationAllContexts(
        internalUserId,
        agentName,
    );

    return request
        .delete(config)
        .then()
        .catch(err => {
            logger.error(`${LOG_MESSAGES.nlp.deleteAllContexts}${err}`);

            return { success: false };
        });
}

/**
 * Deletes a list of contexts from the conversation. The context system is based on the system used by Dialogflow.
 * If you are using an NLP backend that does not use a context system you can just ignore these requests. The request
 * will delete on route `/deleteContexts` with the following JSON:
 * ```
 * {
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
export function deleteSelectedContexts(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): Promise<NlpStatus> {
    const config = createRequestConfigurationSelectedContexts(
        internalUserId,
        agentName,
        contexts,
    );

    return request
        .delete(config)
        .then()
        .catch(err => {
            logger.error(`${LOG_MESSAGES.nlp.deleteSelectedContexts}${err}`);

            return { success: false };
        });
}

function createRequestConfigurationSelectedContexts(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): request.OptionsWithUrl {
    return {
        body: {
            contexts,
            user: internalUserId,
        },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${
                getConfig().platform.nlp.agents[agentName].token
            }`,
            'Content-Type': 'application/json',
        },
        json: true,
        url: `${getConfig().platform.nlp.agents[agentName].url}/deleteContexts`,
    };
}

function createRequestConfigurationAllContexts(
    internalUserId: string,
    agentName: string,
): request.OptionsWithUrl {
    return {
        body: {
            user: internalUserId,
        },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${
                getConfig().platform.nlp.agents[agentName].token
            }`,
            'Content-Type': 'application/json',
        },
        json: true,
        url: `${
            getConfig().platform.nlp.agents[agentName].url
        }/deleteAllContexts`,
    };
}
