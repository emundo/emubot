export type SnipsEntity = {
    value: string;
    entity: string;
};

export type SnipsIntent = {
    intentName: string;
    probability: number;
};

export type SnipsResponse = {
    messages: string[];
    recipent_id: string;
    text: string;
    action?: string;
    contexts?: string[];
    slots: [SnipsEntity];
    intent: SnipsIntent;
};
