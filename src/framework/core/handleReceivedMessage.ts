import {
    ChatAdapterRequest,
    ChatAdapterTextRequest,
} from '../chat_adapter/ChatAdapterRequest';
import { logger } from '../logger';
import { ChatAdapterResponse } from '../chat_adapter/ChatAdapterResponse';
import {
    transformNlpResponseToChatAdapterResponse,
    transformChatAdapterRequestResponseToNlpResponse,
} from './utils/transformMessageType';
import { findBestNlpAnswerForTextRequest } from './utils/findBestNlpAnswerForTextRequest';
import { getOrderedAgents } from './utils/getOrderedAgents';
import { MESSAGES } from '../constants/messages';
import { LOG_MESSAGES } from '../constants/logMessages';
import { Response } from './model/Response';
import { createResponse } from './utils/responseUtils';
import { chatToCore, nlpToCore } from './getInterceptors';
import { NlpResponse } from '../nlp_adapter/model/NlpAdapterResponse';

/**
 * Processes an incoming message, see [here]{@link ../../_build/html/core/core_overview.html} for more detailed information.
 *
 * @param request Message received from the user, already transformed into the generalized `ChatAdapterRequest`-type.
 * @returns An array of `ChatAdapterResponse`s with the content that should be sent to the user. The responses are wrapped
 *          in `Response`s. The wrapper does not contain any further information about what to send to the user, but provides
 *          information _if_ something should be sent to the user at all.
 */

export async function handleReceivedMessageInCore(
    request: ChatAdapterRequest,
    messengerUserId: string,
): Promise<Response<ChatAdapterResponse[]>> {
    try {
        // Send message to the first interceptor (chatToCore).
        const messageAfterFirstInterceptor: Response<ChatAdapterRequest> = await (
            await chatToCore
        ).handleMessage(messengerUserId, request);


        // Message was handled in the interceptor and the processing will stop without sending a message to the user.
        if (messageAfterFirstInterceptor.kind === 'NoResponse') {
            return messageAfterFirstInterceptor;
        }
        /**
         * Interrupted processing: Messages are not sent to an NLP service (e.g. if you want to react to some image
         * sent by the user). The `interruptProcessing`-flag can be set during the first interceptor (chatToCore).
         * Messages of the type 'initial' are only used to validate the userId upon the first interaction. Useful
         * for platforms where the userId has to be created (e.g. personal websites)
         */
        if (messageAfterFirstInterceptor.kind === 'Response') {
            if (
                messageAfterFirstInterceptor.interruptProcessing ||
                messageAfterFirstInterceptor.payload.type === 'initial'
            ) {
                /**
                 * If the processing is interrupted, the second interceptor (nlpToNlp)between NLP answers) is skipped.
                 * Transform message to an NlpResponse and send to the third interceptor (nlpToCore) to e.g. handle
                 * attachments.
                 */
                const transformedNlpResponse = transformChatAdapterRequestResponseToNlpResponse(
                    messageAfterFirstInterceptor,
                );
                const messageRetrievedFromInterceptorNlpToCore = await (
                    await nlpToCore
                ).handleMessage(
                    messageAfterFirstInterceptor.userId,
                    transformedNlpResponse,
                );

                return handleMessageAfterThirdInterceptor(
                    messageRetrievedFromInterceptorNlpToCore,
                );
            } else {
                return await handleMessageDependingOnMessageType(
                    messageAfterFirstInterceptor.payload,
                    messageAfterFirstInterceptor.userId,
                );
            }
        }

        throw new Error(MESSAGES.error.messageHandlingInCore);
    } catch (error) {
        logger.error(`${LOG_MESSAGES.core.handleReceivedMessage} ${error}`);

        return returnErrorAsChatAdapterResponse(
            MESSAGES.error.messageHandlingInCore,
            messengerUserId,
        );
    }
}

/**
 * Message is further processed according to the type:
 * 1. Invalid: If the message is still invalid after returning from the first interceptor (chatToCore),
 *             the user receives an error message. Results in a 400 Bad Request.
 * 2. Text: Text messages are sent to an NLP service.
 * 3. Valid, non-interrupted and non-text messages (currently: all attachments): return error.
 * If you want to handle such messages: Set the `interruptProcessing`-flag during the first interceptor.
 *
 * If you want to handle additional types (like attachments), send them in the interceptor and return a
 * `NoResponse` to the emubot framework.
 */
function handleMessageDependingOnMessageType(
    chatAdapterRequest: ChatAdapterRequest,
    internalUserId: string,
): Promise<Response<ChatAdapterResponse[]>> {
    switch (chatAdapterRequest.type) {
        case 'invalid':
            /**
             * Important: Do not change the userId at the server if your message type is invalid.
             */
            return Promise.resolve(
                createResponse(
                    [
                        {
                            Message: {
                                text: MESSAGES.error.unsupportedFormat,
                                type: 'text',
                            },
                            messengerUserId: internalUserId,
                        } as ChatAdapterResponse,
                    ],
                    400,
                    internalUserId,
                ),
            );
        case 'text':
            return handleTextRequest(chatAdapterRequest, internalUserId);
        default:
            logger.error(LOG_MESSAGES.unsupportedMessageType);
            throw new Error(LOG_MESSAGES.unsupportedMessageType);
    }
}

/**
 * Processes an incoming text request: retrieves best answer from NLP service.
 *
 * @param request Message received from the user, already transformed into the general ChatAdapterRequest-type.
 * @returns The final `ChatAdapterResponse[]` which will be sent to the user.
 */
async function handleTextRequest(
    request: ChatAdapterTextRequest,
    internalUserId: string,
): Promise<Response<ChatAdapterResponse[]>> {
    try {
        if (getOrderedAgents().length === 0) {
            logger.warn(
                `${LOG_MESSAGES.warnings.no_agents} ${JSON.stringify(
                    request,
                    undefined,
                    2,
                )}`,
            );

            return createResponse(
                [
                    {
                        Message: {
                            text: MESSAGES.noAgent,
                            type: 'text',
                        },
                        messengerUserId: internalUserId,
                    } as ChatAdapterResponse,
                ],
                200,
                internalUserId,
            );
        }

        logger.debug(LOG_MESSAGES.textHandlingInit);
        const responseData = await findBestNlpAnswerForTextRequest(
            request,
            internalUserId,
        );
        logger.debug(`${LOG_MESSAGES.response.data}
            ${JSON.stringify(responseData, undefined, 2)}\n ${LOG_MESSAGES.response.action
            }
            ${JSON.stringify(
                responseData.response.textRequestResult,
                undefined,
                2,
            )}`);

        // Interceptor 3: NlpToCore.
        const messageRetrievedFromInterceptorNlpToCore = await (
            await nlpToCore
        ).handleMessage(internalUserId, responseData.response);

        logger.debug(
            `${LOG_MESSAGES.response.after_action}${JSON.stringify(
                messageRetrievedFromInterceptorNlpToCore,
                undefined,
                2,
            )}`,
        );

        return handleMessageAfterThirdInterceptor(
            messageRetrievedFromInterceptorNlpToCore,
        );
    } catch (error) {
        logger.error(`${LOG_MESSAGES.core.handleTextRequest}, ${error}`);
        throw new Error(`${LOG_MESSAGES.core.handleTextRequest}, ${error}`);
    }
}

/**
 * Returns an error message to the user.
 *
 * @param errorMessage Message which will be displayed to the user.
 * @param messengerUserId User identifier. Has to be already depseudonymized!
 */
function returnErrorAsChatAdapterResponse(
    errorMessage: string,
    messengerUserId: string,
): Promise<Response<ChatAdapterResponse[]>> {
    return Promise.resolve(
        createResponse(
            [
                {
                    Message: {
                        text: errorMessage,
                        type: 'text',
                    },
                    messengerUserId,
                } as ChatAdapterResponse,
            ],
            200,
            messengerUserId,
        ),
    );
}

/**
 * Transforms the final messages into the format required by the ChatAdapter.
 *
 * @param response Final response from the NLP service which should be sent to the user.
 *                 Important: `response.userId` has to be already depseudonymized!
 * @returns An array of ChatAdapterResponses constructed from the incoming `response`s.
 */
function handleMessageAfterThirdInterceptor(
    response: Response<NlpResponse>,
): Response<ChatAdapterResponse[]> {
    if (response.kind === 'NoResponse') {
        return response;
    }

    return createResponse(
        transformNlpResponseToChatAdapterResponse(
            response.payload,
            response.userId,
        ),
        response.statusCode,
        response.userId,
    );
}
