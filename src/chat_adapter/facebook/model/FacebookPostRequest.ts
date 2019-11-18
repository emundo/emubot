export type FacebookPostRequest = {
    entry: Entry[];
    object: string;
};

export type Entry = {
    id: string;
    time: number;
    messaging: FacebookMessaging[];
};

export type FacebookMessaging = {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: string;
    message?: Message;
    postback?: {
        title: string;
        payload: string;
    };
};

export type Message = {
    is_echo?: boolean;
    mid: string;
    metadata?: string;
    app_id?: number;
    text?: string;
    quick_reply?: {
        payload: string;
    };
    // FacebookTemplateAttachments currently not supported
    attachments?: (
        | FacebookFallbackAttachment
        | FacebookLocationAttachment
        | FacebookUrlAttachment)[];
    sticker_id?: number;
};

export type FacebookUrlAttachment = {
    type: 'audio' | 'file' | 'image' | 'video';
    payload: {
        url: string;
        sticker_id?: number; // Only if it is an image attachment with a sticker_id
    };
};

export type FacebookFallbackAttachment = {
    type: 'fallback';
    payload: null;
    title: string;
    url: string;
};

export type FacebookLocationAttachment = {
    type: 'location';
    payload: {
        coordinates: {
            lat: number;
            long: number;
        };
    };
};
