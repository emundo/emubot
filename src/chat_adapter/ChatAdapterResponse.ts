import {
    UrlButton,
    PostBackButton,
    CallButton,
} from '../nlp_adapter/model/NlpAdapterResponse';

/**
 * Generic response format for messages that are queued to be sent to the user. Includes an identifier as well as the
 * response. Each message includes its type, the payload (which depends on the type) and the (depseudonymized)
 * `messengerUserId`.
 */
export type ChatAdapterResponse = {
    Message:
        | ChatAdapterTextMessage
        | ChatAdapterAttachmentMessage
        | ChatAdapterQuickReplyMessage
        | ChatAdapterCustomPayloadQuickReplyMessage;
    messengerUserId: string;
};

/**
 * Images and buttons are the only attachments currently supported. Please submit an issue if you think that another
 * type needs to be supported.
 */
export type ChatAdapterAttachmentMessage =
    | ChatAdapterImageAttachmentMessage
    | ChatAdapterButtonAttachmentMessage;

/**
 * Used if the user shall receive a standard text response.
 */
export type ChatAdapterTextMessage = {
    type: 'text';
    text: string;
};

/**
 * Some platforms support different types of buttons. Some commonly used button types
 * are defined below, the different usages are documented in the respective `chatAdapter`.
 */
export type ChatAdapterButtonAttachmentMessage =
    | {
          type: 'urlButton';
          text: string;
          buttons: UrlButton[];
      }
    | {
          type: 'postBackButton';
          text: string;
          buttons: PostBackButton[];
      }
    | {
          type: 'callButton';
          text: string;
          buttons: CallButton[];
      };

/**
 * A simple image which can be retrieved using an url. Locally stored images are currently not supported.
 */
export type ChatAdapterImageAttachmentMessage = {
    type: 'image';
    url: string;
    title?: string;
    sticker_id?: number;
};

/**
 * Quick replies are suggested replies that can be used to visualize different options a user can choose as a reply.
 * The suggestions are often clickable and disappear after selection.
 *
 * Example: https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies/)
 */
export type ChatAdapterQuickReplyMessage = {
    type: 'quickReply';
    title?: string;
    replies: string[];
};

export type ChatAdapterCustomPayloadQuickReplyMessage = {
    type: 'customQuickReply';
    title?: string;
    replies: { [key: string]: string };
};
