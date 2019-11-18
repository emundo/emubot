import {
    NlpResponse,
    NlpText,
    NlpContext,
    NlpParameters,
} from '../../model/NlpAdapterResponse';
import {
    RasaTextResponse,
    RasaParseResponse,
    RasaIntent,
    RasaEntity,
} from '../model/RasaResponse';
import { logger } from '../../../logger';
import { convertStringArrayToNlpContexts } from '../../convertStringArrayToNlpContexts';

function convertToNlpParams(entities: RasaEntity[]): NlpParameters {
    const nlpParams: NlpParameters = {};
    entities.forEach((entity: RasaEntity) => {
        nlpParams[entity.entity] = entity.value;
    });

    return nlpParams;
}

export function toNlpTextResponse(
    parseResult: RasaParseResponse,
    userMessage: string,
    response: RasaTextResponse[],
    agentName: string,
): NlpResponse {
    logger.silly(
        `Resulting Rasa response:${JSON.stringify(response, undefined, 2)}`,
    );

    const messages: NlpText[] = response.map((resp: RasaTextResponse) => {
        return {
            text: resp.text,
            type: 'text',
        } as NlpText;
    });

    const params: NlpParameters = convertToNlpParams(parseResult.entities);
    const mostLikelyIntent: RasaIntent = parseResult.intent;
    const nlpContexts:
        | NlpContext[]
        | undefined = convertStringArrayToNlpContexts(
        parseResult.contexts,
        agentName,
    );

    return {
        agentName: agentName,
        status: {
            errorDetails: undefined,
            errorType: undefined,
            success: true,
        },
        textRequestResult: {
            action: parseResult.action,
            contexts: nlpContexts,
            intentname: mostLikelyIntent.name,
            isFallbackIntent: false,
            message: messages,
            parameters: params,
            resolvedQuery: userMessage,
            score: mostLikelyIntent.confidence,
        },
    };
}
