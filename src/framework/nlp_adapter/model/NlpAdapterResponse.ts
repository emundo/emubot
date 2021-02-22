import * as dialogflow from '@google-cloud/dialogflow'
export type NlpStatus = {
    success: boolean;
    errorType?: string;
    errorDetails?: string | unknown[];
};

export type NlpResponse = {
    textRequestResult: NlpTextRequestResult;
    status: NlpStatus;
    agentName: string;
};

export type NlpTextRequestResult = {
    resolvedQuery: string;
    intentname: string;
    action?: string;
    isFallbackIntent: boolean;
    parameters?: NlpParameters;
    fulfillmentText?: string;
    contexts?: NlpContext[];
    message: NlpMessage[];
    score: number;
};
export type NlpParameters = {
    [key: string]: SingleNlpParameter;
};
type SingleNlpParameter =
    | {
        [key: string]: string;
    }
    | { fields: SingleNlpParameter }
    | string
    | string[]
    | number;

export type NlpContext = {
    name: string;
    /**
     * Contexts in intents expire after either `lifespan` requests or `lifespan * 2` minutes from the time they
     * were activated (whatever happens first).
     */
    lifespan: number;
};

export type NlpMessage =
    | NlpQuickReplies
    | NlpText
    | NlpCustomPayload
    | NlpImage;

export type NlpImage = {
    type: 'image';
    url: string;
    title?: string;
};

export type NlpText = {
    type: 'text';
    text: string;
};

export type NlpQuickReplies = {
    type: 'quickReply';
    title: string;
    replies: string[];
};

/**
 * Developer-defined JSON. It is processed without modifications. Make sure to convert it
 * at the third interceptor (`nlpToChat`) and/or handle it there and return a `NoResponse`.
 */
export type NlpCustomPayload = {
    type: 'custom';
    payload: NlpCustomPayloadButton | NlpCustomPayloadQuickReply | NlpCustomPayloadIStruct;
};

export type UrlButton = {
    type: 'web_url';
    title: string;
    url: string;
};

export type PostBackButton = {
    type: 'postback';
    title: string;
    payload: string; // message to post back to the server
};

export type CallButton = {
    type: 'phone_number';
    title: string;
    payload: string; // phone number
};


export type NlpCustomPayloadIStruct = {
    payload: dialogflow.protos.google.protobuf.IStruct;
    type: 'istruct';
};

export type NlpCustomPayloadButton =
    | {
        type: 'urlButton';
        title: string;
        payload: UrlButton[];
    }
    | {
        type: 'postBackButton';
        title: string;
        payload: PostBackButton[];
    }
    | {
        type: 'callButton';
        title: string;
        payload: CallButton[];
    };

export type NlpCustomPayloadQuickReply = {
    type: 'customQuickReply';
    title: string;
    payload: { [key: string]: string };
};
