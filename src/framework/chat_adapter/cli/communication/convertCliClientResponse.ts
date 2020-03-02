import { ChatAdapterResponse } from '../../ChatAdapterResponse';
import { CliClientResponse } from '../model/CliClientResponse';
import { logger } from '../../../logger';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { MESSAGES } from '../../../constants/messages';

/**
 * This function is used to convert between the internal format and the format of the `CliClient`.
 *
 * @param response Response in the generalized framework format.
 * @returns Reponse in the `CliClient` format.
 *
 */

export function convertIntoCliClientResponse(
    response: ChatAdapterResponse,
): CliClientResponse {
    if (response.Message.type === 'text') {
        return {
            text: response.Message.text,
            id: response.messengerUserId,
        };
    }

    logger.error(`${LOG_MESSAGES.chat.responseTypeNotImplemented} ${response}`);

    return {
        text: MESSAGES.error.handlingBetweenCoreAndChatAdapter,
        id: response.messengerUserId,
    };
}
