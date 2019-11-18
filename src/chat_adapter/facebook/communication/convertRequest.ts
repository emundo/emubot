import {
    UrlAttachment,
    ChatAdapterRequest,
    ValidChatAdapterRequestTypes,
} from '../../ChatAdapterRequest';
import { FacebookMessaging } from '../model/FacebookPostRequest';

/**
 * Converts a Facebook message into a generalized format which is used for further processing steps.
 * Currently supported types are:
 * 1. Standard `text` messages.
 * 2. `attachments` including files, audio, video, images.
 * All other message types (e.g. a transmitted `location` or other `template`s) are currently not directly supported and
 * combined in a `invalid` type. The payload (here: all information included in the message received) is added as a payload
 * in the `invalid` messages, you can thus still handle messages with formats that are not supported by the framework if you
 * use the first interceptor (`chatToCore`).
 *
 * @param message A message received from Facebook and thus includes Facebook-specific
 *                information. Information not required for further processing is discarded.
 * @returns A message in the generalized internal format.
 */
export function convertFacebookRequest(
    message: FacebookMessaging,
): ChatAdapterRequest {
    if (message.message !== undefined) {
        const messagePayload = message.message;
        const isFromAdmin = Boolean(messagePayload.is_echo);

        if (
            messagePayload.attachments &&
            messagePayload.attachments.length > 0
        ) {
            const firstAttachment = messagePayload.attachments[0];
            if (
                firstAttachment.type === 'file' ||
                firstAttachment.type === 'audio' ||
                firstAttachment.type === 'video' ||
                firstAttachment.type === 'image'
            ) {
                const attachment: UrlAttachment = {
                    attachmentType: firstAttachment.type,
                    sticker_id: firstAttachment.payload.sticker_id,
                    type: 'url',
                    url: firstAttachment.payload.url,
                };

                return makeRequest('attachment', attachment, isFromAdmin);
            } else {
                // Default attachment: invalid
                return makeRequest('invalid', message, isFromAdmin);
            }
        } else if (messagePayload.text) {
            return makeRequest('text', messagePayload.text, isFromAdmin);
        }
    } else if (message.postback !== undefined) {
        return makeRequest('text', message.postback.payload, false);
    }

    // Default message: invalid
    return makeRequest('invalid', message, false);
}

/**
 * Helper to convert a received and supported request into the generalized format for the core.
 *
 * @param type The message type.
 * @param message The payload. Can be a string (text request), attachment or anything else if the message type is known.
 * @param isFromAdmin Signals if a message has been sent by the page administrator (which is NOT the user).
 *
 * @returns A message using the generalized framework format.
 */
function makeRequest(
    type: ValidChatAdapterRequestTypes,
    // The following message payload might be unknown. The payload then is `any` and should be handled on your interceptor.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    isFromAdmin: boolean,
): ChatAdapterRequest {
    return {
        isFromAdmin: isFromAdmin,
        message: message,
        type: type,
    } as ChatAdapterRequest;
}
