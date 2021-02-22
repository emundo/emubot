import { ContextsClient } from '@google-cloud/dialogflow';
import { logger } from '../../../logger';
import { DialogflowConfig } from '../dialogflowConfig';
import { getConfig } from '../../..';

export function getAllContexts(
    agentName: string,
    internalUserId: string,
): Promise<void> {
    const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;
    const dialogflowAgent = dialogflowConfig.agents[agentName];
    const contextsClient = new ContextsClient({
        keyFilename: dialogflowAgent.token,
        projectId: dialogflowAgent.project_id,
    });
    const sessionPath = contextsClient.projectAgentSessionPath(
        dialogflowAgent.project_id,
        internalUserId,
    );

    const request = {
        parent: sessionPath,
    };

    return contextsClient
        .listContexts(request)
        .then(responses => {
            logger.verbose(
                `Contexts exists ${JSON.stringify(responses[0], undefined, 2)}`,
            );

            return;
        })
        .catch(err => {
            logger.error(`Failed to list contexts: ${err}?`);

            return;
        });
}
