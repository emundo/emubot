/**
 * From https://developers.facebook.com/docs/messenger-platform/reference/send-api/#recipient:
 * A successful Send API request returns a JSON string containing identifiers for the message and its recipient.
 * Note: Effective February 20, 2018, the Send API no longer includes recipient_id in the response for messages that use
 * `recipient.user_ref` or `recipient.phone_number` to identify the message recipient.
 */
export type FacebookResponseConfirmation = {
    recipient_id: string;
    message_id: string;
};
