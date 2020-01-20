export type FacebookPostResponse = {
    recipient: {
        id: string;
    };
    message: FacebookMessage;
};

export type FacebookMessage =
    | FacebookTextMessage
    | FacebookQuickReplyMessage
    | FacebookAttachmentMessage;

export type FacebookTextMessage = {
    readonly text: string;
};

export type FacebookQuickReplyMessage = FacebookTextMessage & {
    quick_replies: FacebookQuickReply[];
};

export type FacebookQuickReply = FacebookTextQuickReply | OtherQuickReply;

export type FacebookTextQuickReply = {
    readonly content_type: 'text';
    readonly title: string;
    readonly payload: string;
    readonly image_url?: string;
};

type OtherQuickReply = {
    readonly content_type: 'location' | 'user_phone_number' | 'user_email';
    readonly title?: string;
    readonly payload?: string;
    readonly image_url?: string;
};

export type FacebookAttachmentMessage = {
    readonly attachment:
        | FacebookButtonAttachment
        | FacebookImageAttachment
        | FacebookGenericTemplate;
};

// Currently incomplete, mainly supports images with title.
export type FacebookGenericTemplate = {
    readonly type: 'template';
    readonly payload: {
        readonly template_type: 'generic';
        readonly elements: [
            {
                readonly title: string;
                readonly image_url: string;
                readonly default_action: {
                    type: 'web_url';
                    url: string;
                };
            },
        ];
    };
};

export type FacebookButtonAttachment = {
    readonly type: 'template';
    readonly payload: {
        readonly template_type: 'button';
        readonly text: string;
        readonly buttons: FacebookButton[];
    };
};

export type FacebookImageAttachment = {
    readonly type: 'image';
    readonly payload: {
        readonly is_reusable?: boolean;
        readonly url: string;
        readonly sticker_id?: number;
    };
};

export type FacebookButton = FacebookPostbackButton | FacebookUrlButton;

export type FacebookPostbackButton = {
    readonly type: 'postback';
    readonly title: string;
    readonly payload: string;
};

// https://developers.facebook.com/docs/messenger-platform/reference/buttons/url
export type FacebookUrlButton = {
    readonly type: 'web_url';
    readonly url: string;
    readonly title: string;
    readonly webview_height_ratio?: 'compact' | 'tall' | 'full';
    readonly messenger_extensions?: boolean;
    readonly fallback_url?: string;
    readonly webview_share_button?: string;
};
