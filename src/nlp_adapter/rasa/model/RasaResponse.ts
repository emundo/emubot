export type RasaEntity = {
    value: string;
    entity: string;
};

export type RasaIntent = {
    name: string;
    confidence: number;
};
export type RasaResponse = {
    recipent_id: string;
    text: string;
};

export type RasaParseResponse = {
    entities: RasaEntity[];
    intent: RasaIntent;
    contexts?: string[];
    action?: string;
};

export type RasaTextResponse = {
    text: string;
    recipient_id: string;
};
