import {
    NlpResponse,
    NlpMessage,
    NlpCustomPayload,
    NlpCustomPayloadButton,
    NlpCustomPayloadQuickReply,
    NlpTextRequestResult,
} from '../../nlp_adapter/model/NlpAdapterResponse';
import {
    ChatAdapterResponse,
    ChatAdapterButtonAttachmentMessage,
    ChatAdapterCustomPayloadQuickReplyMessage,
} from '../../chat_adapter/ChatAdapterResponse';
import { LOG_MESSAGES } from '../../constants/logMessages';
import { MESSAGES } from '../../constants/messages';
import { logger } from '../../logger';
import { ChatAdapterRequest } from '../../chat_adapter/ChatAdapterRequest';
import { Response } from '../model/Response';

/**
 * Transforms multiple generic NLP messages into an array of generic ChatAdapterResponses.
 *
 * @param nlpMessage Final message that should be sent to the user.
 * @param messengerUserId User identifier. Has to be depseudonymized at this point!
 * @returns Array that can be processed by a ChatAdapter.
 */
export function transformNlpResponseToChatAdapterResponse(
    nlpMessage: NlpResponse,
    messengerUserId: string,
): ChatAdapterResponse[] {
    return nlpMessage.textRequestResult.message.map(message => {
        return transformToChatAdapterResponse(message, messengerUserId);
    });
}

function buildButton(
    button: NlpCustomPayloadButton,
): ChatAdapterButtonAttachmentMessage {
    switch (button.type) {
        case 'urlButton':
            return {
                buttons: button.payload,
                text: button.title,
                type: 'urlButton',
            };
        case 'postBackButton':
            return {
                buttons: button.payload,
                text: button.title,
                type: 'postBackButton',
            };
        case 'callButton':
            return {
                buttons: button.payload,
                text: button.title,
                type: 'callButton',
            };
        default:
            logger.error(LOG_MESSAGES.core.unsupportedButtonError);
            throw new Error(MESSAGES.error.handlingBetweenCoreAndChatAdapter);
    }
}

function buildQuickreply(
    quickReply: NlpCustomPayloadQuickReply,
): ChatAdapterCustomPayloadQuickReplyMessage {
    return {
        replies: quickReply.payload,
        title: quickReply.title,
        type: 'customQuickReply',
    };
}

/**
 * Handles payloads which are usually defined by the operator inside the NLP service.
 *
 * @param message Final response from the NLP service which should be sent to the user.
 * @param messengerUserId User identifier. Has to be depseudonymized at this point!
 */
function handleCustomPayload(
    message: NlpCustomPayload,
    messengerUserId: string,
): ChatAdapterResponse {
    switch (message.payload.type) {
        case 'urlButton':
        case 'postBackButton':
        case 'callButton':
            const button = buildButton(message.payload);

            return { Message: button, messengerUserId };
        case 'customQuickReply':
            const quickreply = buildQuickreply(message.payload);

            return { Message: quickreply, messengerUserId };
        default:
            logger.error(LOG_MESSAGES.core.unsupportedCustomPayloadError);
            throw new Error(MESSAGES.error.handlingBetweenCoreAndChatAdapter);
    }
}

/**
 * Transforms a single NlpMessage into a ChatAdapterResponse.
 *
 * @param message Final response from the NLP service which should be sent to the user.
 * @param messengerUserId User identifier. Has to already be depseudonymized!
 */
function transformToChatAdapterResponse(
    message: NlpMessage,
    messengerUserId: string,
): ChatAdapterResponse {
    switch (message.type) {
        case 'text':
            return {
                Message: { type: 'text', text: message.text },
                messengerUserId,
            };
        case 'quickReply':
            return {
                Message: {
                    replies: message.replies,
                    title: message.title,
                    type: 'quickReply',
                },
                messengerUserId,
            };
        case 'custom':
            return handleCustomPayload(message, messengerUserId);
        case 'image':
            return {
                Message: {
                    title: message.title,
                    type: 'image',
                    url: message.url,
                },
                messengerUserId,
            };
        default:
            logger.verbose(
                LOG_MESSAGES.core.transformToChatAdapterResponseError,
            );
            throw new Error(MESSAGES.error.handlingBetweenCoreAndChatAdapter);
    }
}

/**
 * This function will be called if the processing is interrupted after the first interceptor (chatToCore). The
 * generic ChatAdapterRequest is directly transformed into a generic NlpResponse without sending it to an NLP service.
 * This means that the score and most other information is irrelevant, we only care about possible actions set
 * in the first interceptor.
 *
 * @param request An (interrupted) ChatAdapterRequest.
 * @param returns An `NlpResponse`.
 */
export function transformChatAdapterRequestResponseToNlpResponse(
    request: Response<ChatAdapterRequest>,
): NlpResponse {
    const actionShallBePerformed =
        request.kind === 'Response' ? request.action : undefined;
    const responsePayload: NlpTextRequestResult = {
        action: actionShallBePerformed,
        intentname: 'Attachment',
        isFallbackIntent: false,
        message: [],
        resolvedQuery: 'Attachment',
        score: 1,
    };

    return {
        agentName: 'None',
        status: { success: true },
        textRequestResult: responsePayload,
    };
}
