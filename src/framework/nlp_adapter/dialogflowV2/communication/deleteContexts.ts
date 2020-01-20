import { NlpStatus } from '../../model/NlpAdapterResponse';
import { ContextsClient } from 'dialogflow';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { makeSuccess } from '../../INlpAdapter';

export async function deleteAllContexts(
    internalUserId: string,
    projectId: string,
    agentToken: string,
): Promise<NlpStatus> {
    const contextsClient = new ContextsClient({
        keyFilename: agentToken,
        projectId,
    });

    const sessionPath = contextsClient.sessionPath(projectId, internalUserId);

    try {
        await contextsClient.deleteAllContexts({ parent: sessionPath });

        return makeSuccess();
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.deleteAllContexts}${err}`);

        return { success: false };
    }
}

export async function deleteSelectedContexts(
    internalUserId: string,
    projectId: string,
    agentToken: string,
    contexts: string[],
): Promise<NlpStatus> {
    const contextsClient = new ContextsClient({
        keyFilename: agentToken,
        projectId,
    });

    const sessionPath = contextsClient.sessionPath(projectId, internalUserId);

    const deletedContexts = contexts.map(async context => {
        contextsClient.deleteContext({
            name: `${sessionPath}/contexts/${context}`,
        });
    });

    try {
        await Promise.all(deletedContexts);

        return makeSuccess();
    } catch (err) {
        logger.error(`${LOG_MESSAGES.nlp.deleteAllContexts}${err}`);

        return { success: false };
    }
}
