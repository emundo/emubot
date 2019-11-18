export type SlackResponse = SlackTextResponse;

export type SlackTextResponse = {
    type: 'text';
    text: string;
    user: string;
    channel: string;
};

export type SlackErrorResponse = {
    ok: false;
    error: string;
};

export type SlackOpenChannelResponse = {
    ok: true;
    channel: {
        id: string;
    };
};
