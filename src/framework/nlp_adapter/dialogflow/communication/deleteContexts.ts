import * as request from 'request-promise-native';
import { NlpStatus } from '../../model/NlpAdapterResponse';
import { toNlpStatus } from './responseConverters';
import { makeSuccess } from '../../INlpAdapter';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';

/**
 * Reset all contexts of a conversation.
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentToken Used to define the agent whose contexts shall be deleted.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export async function deleteAllContexts(
    internalUserId: string,
    agentToken: string,
): Promise<NlpStatus> {
    const config = createRequestConfigurationAllContexts(
        internalUserId,
        agentToken,
    );

    try {
        const contextResponse = await request.delete(config);

        return toNlpStatus(contextResponse);
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.deleteAllContexts}${err}`);

        return { success: false };
    }
}

export async function deleteSelectedContexts(
    internalUserId: string,
    agentToken: string,
    contexts: string[],
): Promise<NlpStatus> {
    const contextsToDelete = contexts.map(async context =>
        createRequestConfigurationSelectedContexts(
            internalUserId,
            agentToken,
            context,
        ),
    );

    try {
        await Promise.all(contextsToDelete);

        return makeSuccess();
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.deleteAllContexts}${err}`);

        return { success: false };
    }
}

function createRequestConfigurationSelectedContexts(
    internalUserId: string,
    agentToken: string,
    context: string,
): request.OptionsWithUrl {
    return {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${agentToken}`,
            'Content-Type': 'application/json',
        },
        json: true,
        url: `https://api.dialogflow.com/v1/contexts/${context}?sessionId=${internalUserId}`,
    };
}

function createRequestConfigurationAllContexts(
    internalUserId: string,
    agentToken: string,
): request.OptionsWithUrl {
    return {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${agentToken}`,
            'Content-Type': 'application/json',
        },
        json: true,
        url: `https://api.dialogflow.com/v1/contexts?sessionId=${internalUserId}`,
    };
}
