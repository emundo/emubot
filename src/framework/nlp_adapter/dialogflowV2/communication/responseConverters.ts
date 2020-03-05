import {
    NlpText,
    NlpResponse,
    NlpStatus,
    NlpMessage,
    NlpQuickReplies,
    NlpCustomPayload,
    NlpParameters,
    NlpContext,
} from '../../model/NlpAdapterResponse';
import { logger } from '../../../logger';
import { DetectIntentResponse, Message, Context } from 'dialogflow';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { getConfig } from '../../../core/getConfig';
import { DialogflowAgent, DialogflowConfig } from '../dialogflowConfig';

export function toNlpStatus(response: DetectIntentResponse): NlpStatus {
    return {
        errorDetails: response.webhookStatus.details,
        errorType: response.webhookStatus.message,
        success: response.webhookStatus.code === 0,
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
    responseArray: DetectIntentResponse[],
    agentName: string,
): NlpResponse {
    if (!!responseArray[1]) {
        logger.error(
            `${LOG_MESSAGES.nlp.moreThanOneResponse}${JSON.stringify(
                responseArray[1],
                undefined,
                2,
            )}`,
        );
    }

    const dialogflowConfig = getConfig().platform.nlp as DialogflowConfig;
    const dialogflowAgent = dialogflowConfig.agents[agentName];

    const response = responseArray[0];
    const result = response.queryResult;
    const nlpMessages = result.fulfillmentMessages
        .map(toNlpMessage)
        .filter(Boolean) as NlpMessage[];

    const contexts = result.outputContexts.map(context =>
        getContext(context, dialogflowAgent),
    );
    const isFallback = result.intent.isFallback;
    const isFallbackIntent = isFallback === undefined ? false : isFallback;

    const webhookStatus = response.webhookStatus;
    const status =
        webhookStatus === null
            ? { success: true }
            : ({
                  errorDetails:
                      webhookStatus.details === null
                          ? undefined
                          : response.webhookStatus.details,
                  errorType:
                      response.webhookStatus.message === null
                          ? undefined
                          : response.webhookStatus.message,
                  success:
                      response.webhookStatus.code === null
                          ? true
                          : response.webhookStatus.code === 0,
              } as NlpStatus);

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

function getContext(context: Context, agent: DialogflowAgent): NlpContext {
    let contextName = '';
    if (context.name !== undefined) {
        contextName =
            context.name
                .split('/')
                .slice(-1)
                .pop() || '';
    }
    if (context.lifespanCount !== undefined) {
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

function toNlpMessage(message: Message): NlpMessage | undefined {
    switch (message.message) {
        case 'text':
            return {
                text: message.text.text[0], // Is an array according to docs, unknown when another index will be chosen.
                type: 'text',
            } as NlpText;
        case 'quickReplies':
            return {
                replies: message.quickReplies.quickReplies,
                title: message.quickReplies.title,
                type: 'quickReply',
            } as NlpQuickReplies;
        case 'payload':
            return {
                payload: message.payload,
                type: 'custom',
            } as NlpCustomPayload;
        default:
            logger.error(
                `${LOG_MESSAGES.nlp.adapter.dialogflowV2Adapter}${LOG_MESSAGES.nlp.toNlpMessage}`,
            );

            return undefined;
    }
}
