import {
    ChatAdapterResponse,
    ChatAdapterButtonAttachmentMessage,
    ChatAdapterImageAttachmentMessage,
    ChatAdapterQuickReplyMessage,
    ChatAdapterTextMessage,
} from '../../ChatAdapterResponse';
import {
    FacebookMessage,
    FacebookAttachmentMessage,
    FacebookButtonAttachment,
    FacebookUrlButton,
    FacebookImageAttachment,
    FacebookQuickReplyMessage,
    FacebookTextMessage,
    FacebookGenericTemplate,
    FacebookTextQuickReply,
    FacebookPostbackButton,
    FacebookButton,
} from '../model/FacebookPostResponse';
import { LOG_MESSAGES } from '../../../constants/logMessages';

/**
 * Converts a message from the internal response format to a format that can be understood by the Facebook Messaging API.
 *
 * @param response Chat response using the internal generalized format.
 * @returns A message compatible with the Facebook format.
 */
export function convertToFacebookResponse(
    response: ChatAdapterResponse,
): FacebookMessage | undefined {
    switch (response.Message.type) {
        case 'image':
            return convertToImage(response.Message);
        case 'quickReply':
            return convertToQuickReply(response.Message);
        case 'text':
            return convertToText(response.Message);
        case 'urlButton':
        case 'postBackButton':
            return convertToButtons(response.Message);
        default:
            return undefined;
    }
}

/**
 * Images can have a title or no title. The title should be included in your response and
 * visualized accordingly. Images are automatically retrieved from the url specified. Stickers also count as images.
 *
 * @param response Image attachment that should be sent back to the user.
 * @returns An image in the Facebook format.
 */
function convertToImage(
    response: ChatAdapterImageAttachmentMessage,
): FacebookAttachmentMessage {
    // Images with a title can not be sent as normal images, but have to be sent with a generic template.
    if (response.title !== undefined) {
        return {
            attachment: {
                payload: {
                    elements: [
                        {
                            default_action: {
                                type: 'web_url',
                                url: response.url,
                            },
                            image_url: response.url,
                            title: response.title,
                        },
                    ],
                    template_type: 'generic',
                },
                type: 'template',
            } as FacebookGenericTemplate,
        };
    }

    if (response.sticker_id !== undefined) {
        return {
            attachment: {
                payload: {
                    sticker_id: response.sticker_id,
                    url: response.url,
                },
                type: 'image',
            } as FacebookImageAttachment,
        };
    }

    // Message without title doesnt require the generic template and can be sent as an image attachment.
    return {
        attachment: {
            payload: {
                is_reusable: false,
                url: response.url,
            },
            type: 'image',
        } as FacebookImageAttachment,
    };
}

function convertToQuickReply(
    response: ChatAdapterQuickReplyMessage,
): FacebookQuickReplyMessage {
    const quickReplies = response.replies.map<FacebookTextQuickReply>(
        reply => ({
            content_type: 'text',
            // dummy value: according to the Facebook API, this value is
            // not optional but it is not used by us (yet).
            payload: '',
            title: reply,
        }),
    );

    return {
        quick_replies: quickReplies,
        text: response.title || '',
    };
}

function convertToText(response: ChatAdapterTextMessage): FacebookTextMessage {
    return {
        text: response.text,
    };
}

function convertToButtons(
    response: ChatAdapterButtonAttachmentMessage,
): FacebookAttachmentMessage {
    let buttons: FacebookButton[];

    switch (response.type) {
        case 'urlButton':
            buttons = response.buttons.map<FacebookUrlButton>(button => ({
                title: button.title,
                type: 'web_url',
                url: button.url,
            }));
            break;
        case 'postBackButton':
            buttons = response.buttons.map<FacebookPostbackButton>(button => ({
                payload: button.payload,
                title: button.title,
                type: 'postback',
            }));
            break;
        default:
            throw Error(LOG_MESSAGES.chat.convertToUrlButton);
    }

    const attachment = {
        payload: {
            buttons,
            template_type: 'button',
            text: response.text,
        },
        type: 'template',
    } as FacebookButtonAttachment;

    return { attachment };
}
