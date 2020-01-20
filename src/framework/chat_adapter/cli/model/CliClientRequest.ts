// Format of an incoming message from the CLI chat client.
export type CliClientRequest = CliClientInitialMessage | CliClientMessage;

export type CliClientMessage = {
    type: 'message';
    text: string;
    id: string;
};

export type CliClientInitialMessage = {
    type: 'initial';
    id: string;
};
