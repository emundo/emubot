import { logger } from '../../../logger';
import { NlpStatus } from '../../model/NlpAdapterResponse';
import { toNlpStatus } from './responseConverters';
import { getConfig } from '../../../core/getConfig';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import {
    DialogflowConfig,
    DialogflowAgent,
} from '../../dialogflowV2/dialogflowConfig';
import { postRequest } from '../../../chat_adapter/utils';
import { OptionsWithUrl } from '../../../core/utils/responseUtils';

export async function postContexts(
    internalUserId: string,
    contexts: string[],
    agentToken: string,
): Promise<NlpStatus> {
    try {
        const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;
        const dialogflowAgent = dialogflowConfig.agents[agentToken];
        const allRequestResults = await Promise.all(
            contexts.map(async context => {
                const postConfig = createPostRequestConfiguration(
                    internalUserId,
                    context,
                    dialogflowAgent,
                );

                const requestResult = await postRequest(postConfig);

                logger.debug(
                    `${LOG_MESSAGES.nlp.contextCreated} ${requestResult}`,
                );

                return toNlpStatus(requestResult);
            }),
        );

        logger.debug(
            `${LOG_MESSAGES.nlp.adapter.dialogflowAdapter}${LOG_MESSAGES.nlp.setContexts} \n\t${contexts}`,
        );

        return { success: allRequestResults.every(s => s.success) };
    } catch (error) {
        logger.verbose(
            `${LOG_MESSAGES.nlp.adapter.dialogflowAdapter}${LOG_MESSAGES.nlp.unableToAddContexts}\n\t${contexts}`,
        );
        throw error;
    }
}

function createPostRequestConfiguration(
    internalUserId: string,
    context: string,
    agent: DialogflowAgent,
): OptionsWithUrl {
    return {
        body: {
            lifespan: agent.defaultLifespan,
            name: context,
        },
        options: {

            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${agent.token}`,
                'Content-Type': 'application/json',
            },
            json: true,
        },
        url: `https://api.dialogflow.com/v1/contexts?sessionId=${internalUserId}`,
    };
}
