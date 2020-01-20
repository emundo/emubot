const DEFAULT_MESSAGES = {
    error: {
        general: '',
        handlingBetweenCoreAndChatAdapter:
            'That did not quite work. Something went wrong during processing your answer. Please try again!',
        messageHandlingInCore:
            'A problem occured during the processing of your request. Please try again!',
        unsupportedAttachment:
            'I currently do not support this kind of attachment.',
        unsupportedFormat:
            'I was unable to process your message: Unsupported message type. I can currently only process \
            text messages, audio messages and the following attachments: images (.png or .jpg).',
    },
    noAgent:
        'I currently do not use an agent that allows me to understand natural language.',
};

export let MESSAGES = DEFAULT_MESSAGES;

export function setMessages(messages: typeof DEFAULT_MESSAGES): void {
    MESSAGES = messages;
}
