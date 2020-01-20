import {
    NlpResponse,
    NlpContext,
    NlpParameters,
} from '../../model/NlpAdapterResponse';
import { SnipsResponse, SnipsEntity } from '../model/SnipsTextResponse';
import { logger } from '../../../logger';
import { convertStringArrayToNlpContexts } from '../../convertStringArrayToNlpContexts';

function convertToNlpParams(entities: SnipsEntity[]): NlpParameters {
    const nlpParams: NlpParameters = {};
    entities.forEach((entity: SnipsEntity) => {
        nlpParams[entity.entity] = entity.value;
    });

    return nlpParams;
}

export function toNlpTextResponse(
    response: SnipsResponse,
    userMessage: string,
    agentName: string,
): NlpResponse {
    logger.silly(
        `Resulting Snips response:${JSON.stringify(response, undefined, 2)}`,
    );
    const messages =
        response.messages !== undefined
            ? response.messages.map(m =>
                  Object.assign({ type: 'text', text: m }),
              )
            : [];

    const params: NlpParameters = convertToNlpParams(response.slots);
    const nlpContexts:
        | NlpContext[]
        | undefined = convertStringArrayToNlpContexts(
        response.contexts,
        agentName,
    );

    return {
        agentName,
        status: {
            errorDetails: undefined,
            errorType: undefined,
            success: true,
        },
        textRequestResult: {
            action: response.action,
            contexts: nlpContexts,
            intentname: response.intent.intentName,
            isFallbackIntent: false,
            message: messages,
            parameters: params,
            resolvedQuery: userMessage,
            score: response.intent.probability,
        },
    };
}
