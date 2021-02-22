import {
    NlpResponse,
    NlpStatus,
    NlpMessage,
    NlpParameters,
    NlpContext,
} from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import * as dialogflow from '@google-cloud/dialogflow';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getConfig } from '../../../core/getConfig';
import { DialogflowAgent, DialogflowConfig } from '../dialogflowConfig';

export function toNlpStatus(response: dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentResponse): NlpStatus {
    return {
        errorDetails: response.webhookStatus?.details === null ? "" : response.webhookStatus?.details,
        errorType: response.webhookStatus?.message === null ? "" : response.webhookStatus?.message,
        success: response.webhookStatus?.code === 0,
    };
}

/**
 * Transforms the DialogflowV2-Response into the generalized format used in this framework.
 *
 * @param responseArray Message retrieved from the DialogflowV2 endpoint. Unclear why it
 *                      returns an array (contradicting documentation)
 * @param agentName Name of the agent the query was sent to. Specified as a key in your `config.ts`.
 */
export function toNlpTextResponse(
    response: dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentResponse,
    agentName: string,
): NlpResponse {

    const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;
    const dialogflowAgent = dialogflowConfig.agents[agentName];

    const result = response.queryResult;

    if (result?.fulfillmentMessages === null || result?.fulfillmentMessages === undefined) {
        throw Error(`Malformed NLP response: ${result}`);
    }
    const nlpMessages = result?.fulfillmentMessages
        .map(toNlpMessage)
        .filter(Boolean) as NlpMessage[];

    if (result?.outputContexts === null || result?.outputContexts === undefined) {
        throw Error(`Malformed NLP response: ${result}`);
    }
    const contexts = result.outputContexts.map((context: dialogflow.protos.google.cloud.dialogflow.v2.IContext) =>
        getContext(context, dialogflowAgent),
    );

    if (result?.intent?.isFallback === null || result.intent?.isFallback === undefined)
        throw Error(`Malformed NLP response: ${result}`);

    const isFallback = result.intent.isFallback;
    const isFallbackIntent = isFallback === undefined ? false : isFallback;

    const webhookStatus = response.webhookStatus;
    const status =
        webhookStatus === null || webhookStatus === undefined
            ? { success: true }
            : ({
                errorDetails:
                    webhookStatus.details === null
                        ? undefined
                        : webhookStatus.details,
                errorType:
                    webhookStatus.message === null
                        ? undefined
                        : webhookStatus.message,
                success:
                    webhookStatus.code === null
                        ? true
                        : webhookStatus.code === 0,
            } as NlpStatus);


    if (result.action === null ||
        result.fulfillmentText === null ||
        result.queryText === null || result.queryText === undefined ||
        result.intentDetectionConfidence === null || result.intentDetectionConfidence === undefined)
        throw Error(`Malformed NLP response: ${result}`);

    const transformedNlpResponse: NlpResponse = {
        agentName,
        status,
        textRequestResult: {
            action: result.action,
            contexts,
            fulfillmentText: result.fulfillmentText,
            intentname: result.intent.displayName || 'unknown',
            isFallbackIntent,
            message: nlpMessages,
            parameters: result.parameters as NlpParameters,
            resolvedQuery: result.queryText,
            score: result.intentDetectionConfidence,
        },
    };

    logger.debug(
        `Transformed DialogflowV2 response: ${JSON.stringify(
            transformedNlpResponse,
        )}`,
    );

    return transformedNlpResponse;
}

/**
 * Convert Dialogflow contexts into the generalized format.
 * Dialogflow returns a path with some information regarding the agent and the context name.
 * We split the path, take the last part of the path (only the context name) and set it as our context name.
 */

function getContext(context: dialogflow.protos.google.cloud.dialogflow.v2.IContext, agent: DialogflowAgent): NlpContext {
    let contextName = '';
    if (context.name !== undefined && context.name !== null) {
        contextName =
            context.name
                .split('/')
                .slice(-1)
                .pop() || '';
    }
    if (context.lifespanCount !== undefined && context.lifespanCount !== null) {
        return {
            lifespan: context.lifespanCount,
            name: contextName,
        };
    }

    return {
        lifespan: agent.defaultLifespan,
        name: contextName,
    };
}

function toNlpMessage(message: dialogflow.protos.google.cloud.dialogflow.v2.Intent.IMessage): NlpMessage | undefined {
    if (message.text !== null) {
        if (message.text?.text !== null && message.text?.text !== undefined)
            return {
                text: message.text.text[0],
                type: 'text'
            }
    }

    if (message.quickReplies !== null) {
        if (message.quickReplies?.quickReplies !== null && message.quickReplies?.quickReplies !== undefined
            && message.quickReplies.title !== null && message.quickReplies.title !== undefined) {
            return {
                replies: message.quickReplies.quickReplies,
                title: message.quickReplies.title,
                type: 'quickReply'
            }
        }
    }

    if (message.payload !== null && message.payload !== undefined) {
        return {
            payload: {
                payload: message.payload,
                type: 'istruct'
            },
            type: 'custom'
        }
    }

    logger.error(
        `${LOG_MESSAGES.nlp.adapter.dialogflowV2Adapter}${LOG_MESSAGES.nlp.toNlpMessage}`,
    );

    return undefined;
}
