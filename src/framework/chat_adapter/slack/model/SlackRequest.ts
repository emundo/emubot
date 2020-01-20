export type SlackRequest = SlackMessage;

export type SlackMessage = {
    type: 'message';
    // Channel ID of the channel, private group or DM channel this is message was posted in.
    channel: string;
    // User identifier.
    user: string;
    // The text of the message.
    text: string;
    // Unique per channel. Is the timestamp of the message.
    ts: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    blocks: any; //SlackBlock[];

    ok: boolean;

    subtype?: string;
};
