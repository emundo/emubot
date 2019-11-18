import { DialogflowStatus } from './DialogflowStatus';

type Result = {
    source: string;
    resolvedQuery: string;
    action: string;
    actionIncomplete: boolean;
    contexts: Context[];
    fulfillment: Fulfillment;
    parameters: DialogflowParameters;
    metadata: Metadata;
    score: number;
};

export type DialogflowParameters = {
    [key: string]: Parameter;
};
type Parameter =
    | {
          [key: string]: string;
      }
    | string
    | string[];

type Context = {
    name: string;
    parameters?: DialogflowParameters;
    lifespan: number;
};

type CrappyBoolean = 'true' | 'false';

type Metadata = {
    intentId: string;
    webhookUsed: CrappyBoolean;
    webhookForSlotFillingUsed: CrappyBoolean;
    isFallbackIntent: CrappyBoolean;
    intentName: string;
};

type Fulfillment = {
    speech: string;
    messages: [DialogflowMessage];
    contexts: Context[];
};
type DialogflowMessageText = {
    type: DialogflowMessageTypes.text;
    speech: string;
};

type DialogflowMessageCard = {
    type: DialogflowMessageTypes.cards;
    title: string;
    subtitle: string;
    buttons: CardButtons[];
    text: string;
    postback: string;
};

type CardButtons = {
    text: string;
    postback?: string;
};

type DialogflowMessageQuickReplies = {
    type: DialogflowMessageTypes.quickreplies;
    title: string;
    replies: [string];
};

type DialogflowMessageImage = {
    type: DialogflowMessageTypes.image;
    imageUrl: string;
};

type DialogflowMessageCustomPayload = {
    type: DialogflowMessageTypes.customPayload;
    payload: {}; // Developer defined JSON. It is sent without modifications.
};

export type DialogflowTextResponse = {
    type: 'text';
    id: string;
    timestamp: string;
    lang: string;
    result: Result;
    status: DialogflowStatus;
    sessionId: string;
};

export const enum DialogflowMessageTypes {
    text,
    cards,
    quickreplies,
    image,
    customPayload,
}

export type DialogflowMessage =
    | DialogflowMessageQuickReplies
    | DialogflowMessageText
    | DialogflowMessageCard
    | DialogflowMessageImage
    | DialogflowMessageCustomPayload;
