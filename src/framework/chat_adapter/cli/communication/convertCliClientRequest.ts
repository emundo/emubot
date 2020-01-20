import {
    ChatAdapterRequest,
    ChatAdapterInitialRequest,
} from '../../ChatAdapterRequest';
import { CliClientRequest } from '../model/CliClientRequest';

/**
 * This function is used to convert between the internal format and the format of the `CliClient`.
 *
 * @param message Messages in the format of the `CliClient`.
 * @returns Message in the generalized framework format.
 */
export function convertIntoChatAdapterRequest(
    message: CliClientRequest,
): ChatAdapterRequest {
    switch (message.type) {
        case 'message':
            return {
                message: message.text,
                type: 'text',
                userId: message.id,
                isFromAdmin: false,
            } as ChatAdapterRequest;

        case 'initial':
            return {
                type: 'initial',
            } as ChatAdapterInitialRequest;
    }
}
