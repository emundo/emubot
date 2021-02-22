import * as needle from 'needle';
import { LOG_MESSAGES } from '../constants/logMessages';
import { logger } from '../logger';
import { OptionsWithUrl } from '../core/utils/responseUtils';
import { ChatAdapterResponse } from './ChatAdapterResponse';

/**
 * Transforms a message string and the `messengerUserId` into a `ChatAdapterResponse`.
 *
 * @param message The response that shall be sent to the user.
 * @param messengerUserId The depseudonymized userId.
 */
export function textToResponse(
    message: string,
    messengerUserId: string,
): ChatAdapterResponse {
    return {
        Message: {
            text: message,
            type: 'text',
        },
        messengerUserId,
    };
}

/**
 * Helper to make sure that the messages are sent back to the messaging platform in the correct order.
 *
 * @param messageArray Messages that are sent to the user.
 * @param mappingFunction Function that shall be applied to each value.
 */
export function mapSerialized<T>(
    messageArray: T[],
    mappingFunction: (value: T) => Promise<unknown>,
): Promise<void> {
    return messageArray.length === 0
        ? Promise.resolve()
        : mappingFunction(messageArray[0]).then(() =>
            mapSerialized(messageArray.slice(1), mappingFunction),
        );
}



export function postRequest(requestConfig: OptionsWithUrl): Promise<any> {
    return needle("post", requestConfig.url, requestConfig.body, requestConfig.options).then((resp: needle.NeedleResponse) => {
        if (resp.statusCode !== 200)
            throw Error(`${LOG_MESSAGES.chat.unableToSendResponse}: ${resp.statusCode}`);
        return resp.body;
    }).catch(err => {
        logger.error(`${LOG_MESSAGES.chat.unableToSendResponse}: ${err}`);
        throw err;
    });
}

export function deleteRequest(requestConfig: OptionsWithUrl): Promise<any> {
    return needle("delete", requestConfig.url, requestConfig.body, requestConfig.options).then((resp: needle.NeedleResponse) => {
        if (resp.statusCode !== 200)
            throw Error(`${LOG_MESSAGES.chat.unableToSendResponse}: ${resp.statusCode}`);
        return resp.body;
    }).catch(err => {
        logger.error(`${LOG_MESSAGES.chat.unableToSendResponse}: ${err}`);
        throw err;
    });
}