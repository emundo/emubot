import { logger } from '../../../logger';
import { NlpStatus } from '../../model/NlpAdapterResponse';
import { CreateContextReqeust, ContextsClient } from 'dialogflow';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { DialogflowAgent } from '../dialogflowConfig';

export async function postContexts(
    internalUserId: string,
    agent: DialogflowAgent,
    contexts: string[],
): Promise<NlpStatus> {
    const contextsClient = new ContextsClient({
        keyFilename: agent.token,
        projectId: agent.project_id,
    });
    const sessionPath = contextsClient.sessionPath(
        agent.project_id,
        internalUserId,
    );

    try {
        const allRequestResults = await Promise.all(
            contexts.map(async context => {
                const postConfig = createPostRequestConfiguration(
                    context,
                    sessionPath,
                    agent.defaultLifespan,
                );
                const requestResult = await contextsClient.createContext(
                    postConfig,
                );
                logger.debug(
                    `${LOG_MESSAGES.nlp.contextCreated} ${requestResult}`,
                );

                return {
                    success: true,
                };
            }),
        );
        logger.debug(
            `${LOG_MESSAGES.nlp.adapter.dialogflowAdapter}${LOG_MESSAGES.nlp.setContexts} \n\t${contexts}`,
        );

        return { success: allRequestResults.every(s => s.success) };
    } catch (error) {
        logger.verbose(
            `${LOG_MESSAGES.nlp.adapter.dialogflowV2Adapter}
             ${LOG_MESSAGES.nlp.unableToAddContexts} \n\t
             ${contexts}: ${error}`,
        );
        throw error;
    }
}

function createPostRequestConfiguration(
    context: string,
    sessionPath: string,
    defaultLifespan: number,
): CreateContextReqeust {
    return {
        context: {
            lifespanCount: defaultLifespan,
            name: `${sessionPath}/contexts/${context}`,
            parameters: [],
        },
        parent: sessionPath,
    };
}
