import {
    NlpText,
    NlpResponse,
    NlpStatus,
    NlpParameters,
    NlpQuickReplies,
    NlpCustomPayload,
    NlpMessage,
    NlpContext,
} from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import {
    DialogflowTextResponse,
    DialogflowMessageTypes,
    DialogflowMessage,
} from '../model/DialogflowTextResponse';
import { DialogflowContextResponse } from '../model/DialogflowContextResponse';
import { LOG_MESSAGES } from '../../../constants/logMessages';

export function toNlpStatus(response: DialogflowContextResponse): NlpStatus {
    return {
        errorDetails: response.status.errorDetails,
        errorType: response.status.errorType,
        success: response.status.code === 200,
    };
}

export function toNlpTextResponse(
    response: DialogflowTextResponse,
    agentName: string,
): NlpResponse {
    const result = response.result;
    const status = response.status;
    const nlpMessages = result.fulfillment.messages
        .map(toNlpMessage)
        .filter(Boolean) as NlpMessage[];
    let contexts: NlpContext[] = [];
    if (result.contexts !== undefined) {
        contexts = result.contexts.map(context => ({
            lifespan: context.lifespan,
            name: context.name,
        }));
    }

    const isFallbackIntent = result.metadata.isFallbackIntent === 'true';

    return {
        agentName,
        status: {
            errorDetails: status.errorDetails,
            errorType: status.errorType,
            success: status.code === 200,
        },
        textRequestResult: {
            action: result.action,
            contexts,
            intentname: result.metadata.intentName,
            isFallbackIntent,
            message: nlpMessages,
            parameters: result.parameters as NlpParameters,
            resolvedQuery: result.resolvedQuery,
            score: result.score,
        },
    };
}

function toNlpMessage(message: DialogflowMessage): NlpMessage | undefined {
    switch (message.type) {
        case DialogflowMessageTypes.text:
            return {
                text: message.speech,
                type: 'text',
            } as NlpText;
        case DialogflowMessageTypes.quickreplies:
            return {
                replies: message.replies,
                title: message.title,
                type: 'quickReply',
            } as NlpQuickReplies;
        case DialogflowMessageTypes.customPayload:
            return {
                payload: message.payload,
                type: 'custom',
            } as NlpCustomPayload;
        default:
            logger.error(
                `${LOG_MESSAGES.nlp.adapter.dialogflowAdapter}${LOG_MESSAGES.nlp.toNlpMessage}`,
            );

            return undefined;
    }
}
