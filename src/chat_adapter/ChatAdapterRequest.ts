/**
 * `ChatAdapterRequest`s are user messages that are transformed from a messaging specific format into a generalized format.
 * Currently, only text messages and attachments are supported. If a message does not belong into one of these categories it
 * counts as an undefined/invalid request, which can be handled in the first interceptor (`chatToCore`) if desired. If it is
 * not handled by yourself, the framework will return an error message to the user.
 *
 * Requests always include:
 * 1. Their `type: string`
 * 2. `isFromAdmin: boolean`: A flag that indicates whether the message is sent from another person that administers
 *                            the page and is NOT the user.
 * 3. `message`: Some payload. Its content depends on the type of the message.
 */
export type ChatAdapterRequest =
    | ChatAdapterTextRequest
    | ChatAdapterAttachmentRequest
    | ChatAdapterUndefinedRequest
    | ChatAdapterInitialRequest;

export type ValidChatAdapterRequestTypes =
    | 'text'
    | 'attachment'
    | 'initial'
    | 'invalid';

/**
 * Standard text request. Payload is a `string`.
 */
export type ChatAdapterTextRequest = {
    readonly type: 'text';
    readonly isFromAdmin: boolean;
    readonly message: string;
};

/**
 * Can be used when first connecting a user with the framework (e.g. sending a ping upon loading a website for the
 * first time). Relevant if you implement a `chatAdapter` for your own messaging service and have to distribute a
 * `messagingUserId`. The `messagingUserId` can be generated by the server and sent back to the client.
 */
export type ChatAdapterInitialRequest = {
    readonly type: 'initial';
};

/**
 * Payload is an Attachment.
 */
export type ChatAdapterAttachmentRequest = {
    readonly type: 'attachment';
    readonly isFromAdmin: boolean;
    readonly message: RequestAttachment;
};

/**
 * Requests that do not correspond to a supported ChatAdapterRequest type. The original payload is stored in the
 * `message`-field. You can specify how to further handle the message in the first interceptor (`chatToCore`). If
 * you do not wish to change the payload or handle the message, the interceptor can simply return a
 * `ChatAdapterUndefinedRequest`, which will trigger a message to the user stating that the type of message is not supported.
 */
export type ChatAdapterUndefinedRequest = {
    readonly type: 'invalid';
    readonly isFromAdmin: boolean;
    // `any` is explicitly allowed since the whole message is put into the payload of undefined messages. You can handle
    // the messages at the first interceptor.
    readonly message: unknown;
};

export type RequestAttachment = UrlAttachment | IdAttachment;
type AttachmentType = 'audio' | 'video' | 'image' | 'file' | 'template';

/**
 * `UrlAttachments` require a URL from which the data will be downloaded and sent to the user. Limitations regarding the size
 * might apply and depend on the platform. Example: Files larger than 25MB cannot be sent using Facebook.
 */
export type UrlAttachment = {
    readonly type: 'url';
    readonly attachmentType: AttachmentType;
    readonly url: string;
    readonly sticker_id?: number;
};

/**
 * An `IdAttachment` uses an identifier assigned to some attachment saved on the messaging platform's server. The id is used
 * for referencing, and points to the file that shall be sent to the user. Useful if the same file is sent repeatedly.
 */
export type IdAttachment = {
    readonly type: 'id';
    readonly attachmentType: AttachmentType;
    readonly attachmentId: string;
};

export function isTextRequest(
    message: ChatAdapterRequest | ChatAdapterTextRequest,
): message is ChatAdapterTextRequest {
    return message.type === 'text';
}

export function isAttachmentRequest(
    message: ChatAdapterRequest | ChatAdapterAttachmentRequest,
): message is ChatAdapterTextRequest {
    return message.type === 'attachment';
}
