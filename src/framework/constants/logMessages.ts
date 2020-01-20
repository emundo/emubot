const DEFAULT_LOG_MESSAGES = {
    chat: {
        convertToUrlButton: 'Only URL buttons are implemented as of yet.',
        cli: 'CLI client',
        facebook: 'Facebook',
        slack: 'Slack',
        incomingGetRequest: 'Received incoming GET request',
        incomingPostRequest: 'Received incoming POST request.',
        initWebhook: 'Init webhook for ',
        missingAppSecret: 'Missing app_secret in config file.',
        missingPageAccessToken: 'Missing page_access_token in config file.',
        missingVerifyToken: 'Missing verify_token in config file.',
        noPageSubscriptionEvent:
            '404 Not Found- Event is not from a page subscription.',
        noUrlProvided: 'No URL provided.',
        noWebsocketError: 'No websocket with the messengerUserID ',
        pageSubscriptionEvent: 'Page subscription event.',
        payloadNotVerified: 'The sha1 signature could not be verified.',
        responseTypeNotImplemented:
            'CustomChatAdapter: Not implemented response type: ',
        sendingMessageToUser: 'Sending message to user ',
        unableToSendResponse: 'Message could not be sent to user.',
        defaultConfiguration:
            'No configuration was set. Starting in default configuration.',
        webhookListening: 'Webhook is listening on port',
        webhookNotVerfied:
            'Unable to verify Webhook. Unauthorized Access: Verify tokens not present',
        webhookVerified: 'Webhook is verfified.',
        websocketError: 'Message could not be sent to user (contactClient).',
    },
    connections: {
        component: {
            database: 'database',
            websocket: 'WebSocket',
        },
        userConnectedTo: 'User connected to ',
    },
    core: {
        handleReceivedMessage:
            'Core: Error whilst handling received message in core (handleReceivedMessageInCore) => ',
        handleTextRequest: 'Core: handleTextRequest => ',
        isFallbackIntent: 'Is fallback intent.',
        noResponseNotPossible: 'No Response should not occur in this adapter.',
        scoreBelowThreshold: 'Score below threshold.',
        sendToNextAgent: 'Send request to next agent...',
        transformToChatAdapterResponseError:
            'An error occured during the transformation of the NLPMessage to ChatAdapterResponse.',
        unsupportedButtonError: 'This button is not supported.',
        unsupportedCustomPayloadError: 'This payload is not supported.',
    },
    database: {
        connectionUndefined:
            'Connection to database failed. Connection undefined.',
        failedToConnect: 'Failed to connect to database: ',
        userNotFoundOrCreatable:
            'User not found and provided information is insufficient to create.',
    },
    initializeLogging: 'Initialized Logger on level: ',
    nlp: {
        adapter: {
            dialogflowAdapter: 'DialogflowAdapter: ',
            dialogflowV2Adapter: 'DialogflowV2Adapter: ',
            rasaAdapter: 'RasaAdapter: ',
        },
        contextCreated:
            'Context created. API v2 typings are weird, log response and change framework',
        deleteAllContexts: 'Error whilst deleting all contexts: ',
        deleteSelectedContexts: 'Error whilst deleting selected contexts: ',
        moreThanOneResponse:
            'Error: A miracle! More than one response returned. Examine me: ',
        sendTextRequest: 'Error Occured in sendTextRequest: ',
        setContexts: 'Added the following contexts: ',
        toNlpMessage: 'Unknown message type.',
        unableToAddContexts:
            'unable to set at least one of the following contexts: ',
    },
    request: {
        text_request: 'Sending a message to agent. Message content: ',
    },
    response: {
        action: 'Action: ',
        after_action: 'After action: ',
        agent: 'Agent: ',
        data: 'Response data: ',
        score: 'Score is: ',
    },
    textHandlingInit: 'Inside text handling...',
    unsupportedMessageType: 'Unsupported type',
    warnings: {
        hash_mismatch:
            'The provided message does not match the provided hash: ',
        no_agents: 'No agents were provided for request: ',
    },
};

export let LOG_MESSAGES = DEFAULT_LOG_MESSAGES;

export function setLogMessages(messages: typeof DEFAULT_LOG_MESSAGES): void {
    LOG_MESSAGES = messages;
}
