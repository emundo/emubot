import { DetectIntentResponse } from 'dialogflow';
import * as winston from 'winston';
import * as express from 'express';
import * as http from 'http';
import SlackEventAdapter from '@slack/events-api/dist/adapter';

/// <reference types="typescript" />
/// <reference types="node" />

export as namespace emubot;

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
    | {
          fields: SingleNlpParameter;
      }
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
    payload: NlpCustomPayloadButton | NlpCustomPayloadQuickReply;
};
export type UrlButton = {
    type: 'web_url';
    title: string;
    url: string;
};
export type PostBackButton = {
    type: 'postback';
    title: string;
    payload: string;
};
export type CallButton = {
    type: 'phone_number';
    title: string;
    payload: string;
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
    payload: {
        [key: string]: string;
    };
};

export type TextRequest = {
    internalUserId: string;
    message: string;
};

/**
 * Implementing this interface is required by all classes that implement the functionality of NLP
 * services (also called NLP adapters).
 *
 * Not all NLP services implement the same concepts with the same naming, we will try to keep our
 * definitions as clear as possible. For more information regarding the concepts in terms of the
 * respective NLP service, please consult our external documentation.
 */
export interface NlpAdapter {
    /**
     * Lifespan of a context (see [Lifespan]{@link ../../_build/html/nlp_adapter/custom_nlp_adapter.html}).
     */
    lifespanInMinutes: number;
    /**
     * Deletes **ALL** contexts of a session specified by `internalUserId`.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;
    /**
     * Deletes selected contexts, specified by their name.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     * @param contextsToDelete An array of context names that shall be deleted.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextsToDelete: string[],
    ): Promise<NlpStatus>;
    /**
     * Posts an array of contexts to an NLP service.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param contextsToPost Array of names of contexts that should be set.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    postContexts(
        internalUserId: string,
        agentName: string,
        contextsToPost: string[],
    ): Promise<NlpStatus>;
    /**
     * Send a single text request to an NLP service.
     *
     * @param textRequest Includes the user identifier (should be pseudonymized at this point) and
     *                    the message that should be classified by the NLP service.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpResponse which is preprocessed to be further processed by the core.
     */
    sendSingleTextRequest(
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}
/**
 * Signals that an action, such as posting a context, has been successful.
 */
export function makeSuccess(): NlpStatus;

/**
 * `ChatAdapterRequest`s are user messages that are transformed from a messaging specific format into a generalized format.
 * Currently, only text messages and attachments are supported. If a message does not belong into one of these categories it
 * counts as an undefined/invalid request, which can be handled in the first interceptor (`chatToCore`) if desired. If it is
 * not handled by yourself, the framework will return an error message to the user.
 *
 * Requests always include:
 * 1. Their `type: string`
 * 2. `isFromAdmin: boolean`: A flag that indicates whether the message is sent from another person that administers
 *                            the page and is NOT the user.
 * 3. `message`: Some payload. Its content depends on the type of the message.
 */
export type ChatAdapterRequest =
    | ChatAdapterTextRequest
    | ChatAdapterAttachmentRequest
    | ChatAdapterUndefinedRequest
    | ChatAdapterInitialRequest;
export type ValidChatAdapterRequestTypes =
    | 'text'
    | 'attachment'
    | 'initial'
    | 'invalid';
/**
 * Standard text request. Payload is a `string`.
 */
export type ChatAdapterTextRequest = {
    readonly type: 'text';
    readonly isFromAdmin: boolean;
    readonly message: string;
};
/**
 * Can be used when first connecting a user with the framework (e.g. sending a ping upon loading a website for the
 * first time). Relevant if you implement a `chatAdapter` for your own messaging service and have to distribute a
 * `messagingUserId`. The `messagingUserId` can be generated by the server and sent back to the client.
 */
export type ChatAdapterInitialRequest = {
    readonly type: 'initial';
};
/**
 * Payload is an Attachment.
 */
export type ChatAdapterAttachmentRequest = {
    readonly type: 'attachment';
    readonly isFromAdmin: boolean;
    readonly message: RequestAttachment;
};
/**
 * Requests that do not correspond to a supported ChatAdapterRequest type. The original payload is stored in the
 * `message`-field. You can specify how to further handle the message in the first interceptor (`chatToCore`). If
 * you do not wish to change the payload or handle the message, the interceptor can simply return a
 * `ChatAdapterUndefinedRequest`, which will trigger a message to the user stating that the type of message is not supported.
 */
export type ChatAdapterUndefinedRequest = {
    readonly type: 'invalid';
    readonly isFromAdmin: boolean;
    readonly message: unknown;
};
export type RequestAttachment = UrlAttachment | IdAttachment;
type AttachmentType = 'audio' | 'video' | 'image' | 'file' | 'template';
/**
 * `UrlAttachments` require a URL from which the data will be downloaded and sent to the user. Limitations regarding the size
 * might apply and depend on the platform. Example: Files larger than 25MB cannot be sent using Facebook.
 */
export type UrlAttachment = {
    readonly type: 'url';
    readonly attachmentType: AttachmentType;
    readonly url: string;
    readonly sticker_id?: number;
};
/**
 * An `IdAttachment` uses an identifier assigned to some attachment saved on the messaging platform's server. The id is used
 * for referencing, and points to the file that shall be sent to the user. Useful if the same file is sent repeatedly.
 */
export type IdAttachment = {
    readonly type: 'id';
    readonly attachmentType: AttachmentType;
    readonly attachmentId: string;
};
export function isTextRequest(
    message: ChatAdapterRequest | ChatAdapterTextRequest,
): message is ChatAdapterTextRequest;
export function isAttachmentRequest(
    message: ChatAdapterRequest | ChatAdapterAttachmentRequest,
): message is ChatAdapterTextRequest;

/**
 * Generic response format for messages that are queued to be sent to the user. Includes an identifier as well as the
 * response. Each message includes its type, the payload (which depends on the type) and the (depseudonymized)
 * `messengerUserId`.
 */
export type ChatAdapterResponse = {
    Message:
        | ChatAdapterTextMessage
        | ChatAdapterAttachmentMessage
        | ChatAdapterQuickReplyMessage
        | ChatAdapterCustomPayloadQuickReplyMessage;
    messengerUserId: string;
};
/**
 * Images and buttons are the only attachments currently supported. Please submit an issue if you think that another
 * type needs to be supported.
 */
export type ChatAdapterAttachmentMessage =
    | ChatAdapterImageAttachmentMessage
    | ChatAdapterButtonAttachmentMessage;
/**
 * Used if the user shall receive a standard text response.
 */
export type ChatAdapterTextMessage = {
    type: 'text';
    text: string;
};
/**
 * Some platforms support different types of buttons. Some commonly used button types
 * are defined below, the different usages are documented in the respective `chatAdapter`.
 */
export type ChatAdapterButtonAttachmentMessage =
    | {
          type: 'urlButton';
          text: string;
          buttons: UrlButton[];
      }
    | {
          type: 'postBackButton';
          text: string;
          buttons: PostBackButton[];
      }
    | {
          type: 'callButton';
          text: string;
          buttons: CallButton[];
      };
/**
 * A simple image which can be retrieved using an url. Locally stored images are currently not supported.
 */
export type ChatAdapterImageAttachmentMessage = {
    type: 'image';
    url: string;
    title?: string;
    sticker_id?: number;
};
/**
 * Quick replies are suggested replies that can be used to visualize different options a user can choose as a reply.
 * The suggestions are often clickable and disappear after selection.
 *
 * Example: https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies/)
 */
export type ChatAdapterQuickReplyMessage = {
    type: 'quickReply';
    title?: string;
    replies: string[];
};
export type ChatAdapterCustomPayloadQuickReplyMessage = {
    type: 'customQuickReply';
    title?: string;
    replies: {
        [key: string]: string;
    };
};

/**
 * Generic response type that will be returned from our interceptors.
 * A `Response` either returns a payload and additional information that can be used in the next processing steps
 * or it returns a `NoResponse`.
 */
export type Response<T> =
    | {
          payload: T;
          kind: 'Response';
          statusCode: number;
          userId: string;
          interruptProcessing?: boolean;
          action?: string;
      }
    | NoResponse;
/**
 * If `NoResponse` is returned from an interceptor the user does not receive a visible message.
 */
export type NoResponse = {
    kind: 'NoResponse';
    statusCode: number;
    userId: string;
};

/**
 * ChatAdapter includes the minimal requirements/functions that have to be implemented by every `ChatAdapter`. This
 * interface is important if you want to implement your own `ChatAdapter`.
 *
 * Usually you want to include functions to e.g. transform a message from a ChatAdapterResponse to the platform-specific
 * format. This is handled internally by the distinctive adapter. See `FacebookAdapter` for an exemplary implementation.
 */
export interface ChatAdapter {
    /**
     * Initializes a webserver and awaits incoming messages that shall be processed. A `handleRequest` function that
     * determines how you want to handle incoming messages has to be passed to the `init()` function. `handleRequest`
     * should handle responses to the user in a session established by the client through an incoming message.
     * Use `contactClient` if you want to send a message outside of the usual workflow (e.g. self-defined actions)
     */
    init(
        handleRequest: (
            request: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void>;
    /**
     * Shuts down the chat adapter. This method is used by the core in order to close the Botframework.
     */
    deinit(): Promise<void>;
    /**
     * Required to send a message to the client outside of the usual workflow.
     *
     * The way this is implementated can vary. You could e.g. use a websocket or, if allowed by the messaging platform,
     * directly post to the respective API.
     *
     * @param response A `ChatAdapterResponse` with the content that should be sent to the user.
     */
    contactClient(response: ChatAdapterResponse): Promise<void>;
}

/**
 * Interface that defines an `Interceptor`.
 *
 * While you can stop the pipeline processing in your interceptor and return a `NoResponse`, you should
 * provide some feedback to the user that the request was successful (or not). You can do that by either returning
 * a suitable message to the emubot framework or using one of the alternative contact routes provided by the used
 * `ChatAdapter` via the `contactClient` method.
 *
 * The emubot framework has some examples for different interceptors that you can find in our extended example
 * [here](https://github.com/emundo/emubot-extended-example/).
 *
 * emubot uses three interceptors:
 *
 * 1. Interceptor `chatToCore`,
 * 2. Interceptor `nlpToNlp` and
 * 3. Interceptor `nlpToCore`.
 *
 * Interceptor `chatToCore` handles the message after transforming it into a common format and before any internal or
 * external state is changed. Invalid requests should be handled here (log or further process them). The `payload.type`
 * should be changed in your custom code if you want to further process the message. If the type remains 'invalid',
 * an error message is returned to the user.
 *
 * Common use cases include:
 * 1. Pseudonymization of the messengerUserId.
 * 2. Handling messages which are no text messages.
 * 3. Save values in a database or retrieve them.
 *
 * Possible invalid messages are e.g. 'Location' which can be received from Facebook, but which are not supported yet.
 * Specialized and platform-specific types will most likely not be supported by this framework to avoid bloated code.
 *
 * Possible solutions:
 * 1. Contact us if you think that a type required by yourself will be required by a large group of users.
 * 2. (Fastest solution) Fork the repo and add the types to the relevant Adapter and ChatAdapterRequest.
 * 3. A generic payload type might be added in the future, where most information from the message could be accessed,
 * if the current type is too restrictive.
 *
 *
 * Interceptor `nlpToNlp` intercepts the message during the determination which agent should be used. Mainly required if
 * multiple agents are used (otherwise a default `MirrorInterface` should suffice).
 *
 * Common use cases are:
 * 1. Stop the decision making early: Accept messages (e.g. fallbacks depending on the context).
 * 2. Delete/Add contexts if the message of a specific agent is not used in the user response.
 *
 *
 * Interceptor `nlpToCore` intercepts the already determined, final message from the NLP service. Takes an NlpResponse as
 * input and returns another NlpResponse.
 *
 * Common use cases are:
 * 1. Execute external actions.
 * 2. Save values in a database or retrieve values.
 * 3. Depseudonymize the internalUserId.
 *
 */
export interface Interceptor<T, U> {
    /**
     *
     * @param userId A user identifier required to process the message. Should be depseudonymized when
     *               receiving/sending a text from/to the messaging platform and pseudonymized when
     *               sending it to an NLP service.
     * @param message The respective message. The type and content of the message depends on the stage where the message
     *                is processed (e.g. before sending it to the NLP service or afterwards)
     * @returns A (usually user-defined) `Response`.
     */
    handleMessage(userId: string, message: T): Promise<Response<U>>;
}

/**
 * Used to specify the type of a class constructor (NLP or Chat)
 * */
export interface ClassConstructor<T> {
    new (): T;
}
/**
 * A (chat)bot can be deployed on a messaging service. The bot can consist of multiple so called _agents_.
 * An agent is a coherent entity, usually tasked to process certain queries (e.g. an agent to process smalltalk
 * and another agent with additional functionality that provides utility like information regarding a service).
 * Usually, a query is first sent to one agent, and then to another agent if thedetection certainty (the score)
 * has not been high enough.
 *
 * An `Agent` has:
 * 1. `executionIndex`: signals when an agent will be asked. The higher the `executionIndex`, the faster the agent
 *      will be asked. Example: You have three agents with executionIndices [2,3,1].
 *      The third agent (with the executionIndex 1) will be contacted first.
 * 2. `minScore`: minimal score to mark a response from an agent as `certain`. If the NLP service returns a score
 *      lower than `minScore`, the next agent will be contacted.
 * 3. `token`: authentication token of the NLP service.
 * 4. `project_id`: an identifier for e.g. Google Cloud Projects. Not relevant for all platforms, take a look at the
 *      respective adapters.
 * 5. `url`: url pointing to the NLP service. Especially relevant if the service does not have a fixed endpoint
 *      (e.g. when using open source services)
 * 6. `languageCode`: signaling the language of your agent.
 */
export type Agent = {
    executionIndex: number;
    minScore: number;
    token: string;
    url: string;
    languageCode: string;
    defaultLifespan?: number;
};
/**
 * Includes all `Agent`s relevant to your service.
 */
export type Agents = {
    [key: string]: Agent;
};
/**
 * A basic configuration for your chat adapter. Your own implementation of a chat adapter should implement this type,
 * containing:
 *
 * 1. `constructor`: Implements the `ChatAdapter` interface.
 * 2. `name`: The name of your messaging platform. Used for logging purposes.
 * 3. `url`: The url of the messaging API with which you communicate.
 * 4. `webhook`: The framework internal webhook path to which a messaging API sends its requests
 */
export type ChatConfig<SpecificChatAdapter extends ChatAdapter> = {
    constructor: ClassConstructor<SpecificChatAdapter>;
    name: string;
    url: string;
    webhook_path: string;
    appSecret: string;
};
export type NlpConfig<SpecificNlpAdapter extends NlpAdapter> = {
    agents: Agents;
    constructor: ClassConstructor<SpecificNlpAdapter>;
    name: string;
};
export type ServerConfig = {
    port: number;
};
export type InterceptorConfig = {
    chatToCore: () => Promise<
        Interceptor<ChatAdapterRequest, ChatAdapterRequest>
    >;
    nlpToCore: () => Promise<Interceptor<NlpResponse, NlpResponse>>;
    nlpToNlp: () => Promise<Interceptor<NlpResponse, NlpResponse>>;
};
export type Config<
    SpecificChatAdapter extends ChatAdapter,
    SpecificNlpAdapter extends NlpAdapter
> = {
    interceptors: InterceptorConfig;
    platform: {
        chat: ChatConfig<SpecificChatAdapter>;
        nlp: NlpConfig<SpecificNlpAdapter>;
    };
    server: ServerConfig;
};

/**
 * Convenience function to provide access to the current configuration.
 *
 * @returns The current configuration.
 */
export function getConfig(): Config<ChatAdapter, NlpAdapter>;
/**
 * Function that sets a provided configuration file. Please note that the emubot framework can not change the
 * configuration while it is already running. Calling this function while the emubot framework is running will
 * lead to unexpected behaviour.
 *
 * @param userConfig Configuration with which to run the emubot framework.
 */
export function setConfig(userConfig: Config<ChatAdapter, NlpAdapter>): void;

export type Adapter = {
    nlp: NlpAdapter;
    chat: ChatAdapter;
};
/**
 * Convenience object to provide access to the NlpAdapter and ChatAdapter.
 */
export const adapter: Adapter;

export const DEFAULT_MESSAGES: {
    error: {
        general: string;
        handlingBetweenCoreAndChatAdapter: string;
        messageHandlingInCore: string;
        unsupportedAttachment: string;
        unsupportedFormat: string;
    };
    noAgent: string;
    noConfigurationFileProvided: string;
};
export let MESSAGES: {
    error: {
        general: string;
        handlingBetweenCoreAndChatAdapter: string;
        messageHandlingInCore: string;
        unsupportedAttachment: string;
        unsupportedFormat: string;
    };
    noAgent: string;
    noConfigurationFileProvided: string;
};
export function setMessages(messages: typeof DEFAULT_MESSAGES): void;

/**
 * Default configuration which is set in the absence of any other configuration. In this case the framework will
 * not run the message through the core pipeline since that would require a valid NLP configuration. The framework
 * will start with the CLI adapter.
 */
export function dummyHandleMessage(
    _: ChatAdapterRequest,
    userId: string,
): Promise<Response<ChatAdapterResponse[]>>;
export const DEFAULT_LOG_MESSAGES: {
    chat: {
        convertToUrlButton: string;
        cli: string;
        facebook: string;
        slack: string;
        incomingGetRequest: string;
        incomingPostRequest: string;
        initWebhook: string;
        missingAppSecret: string;
        missingPageAccessToken: string;
        missingVerifyToken: string;
        noPageSubscriptionEvent: string;
        noUrlProvided: string;
        noWebsocketError: string;
        pageSubscriptionEvent: string;
        payloadNotVerified: string;
        responseTypeNotImplemented: string;
        sendingMessageToUser: string;
        unableToSendResponse: string;
        defaultConfiguration: string;
        webhookListening: string;
        webhookNotVerfied: string;
        webhookVerified: string;
        websocketError: string;
        unknownClient: string;
    };
    connections: {
        component: {
            database: string;
            websocket: string;
        };
        userConnectedTo: string;
    };
    core: {
        handleReceivedMessage: string;
        handleTextRequest: string;
        isFallbackIntent: string;
        noResponseNotPossible: string;
        scoreBelowThreshold: string;
        sendToNextAgent: string;
        transformToChatAdapterResponseError: string;
        unsupportedButtonError: string;
        unsupportedCustomPayloadError: string;
        couldNotStopCore: string;
    };
    database: {
        connectionUndefined: string;
        failedToConnect: string;
        userNotFoundOrCreatable: string;
    };
    initializeLogging: string;
    nlp: {
        adapter: {
            dialogflowAdapter: string;
            dialogflowV2Adapter: string;
            rasaAdapter: string;
        };
        contextCreated: string;
        deleteAllContexts: string;
        deleteSelectedContexts: string;
        moreThanOneResponse: string;
        sendTextRequest: string;
        setContexts: string;
        toNlpMessage: string;
        unableToAddContexts: string;
    };
    request: {
        text_request: string;
    };
    response: {
        action: string;
        after_action: string;
        agent: string;
        data: string;
        score: string;
    };
    textHandlingInit: string;
    unsupportedMessageType: string;
    warnings: {
        hash_mismatch: string;
        no_agents: string;
    };
};
export let LOG_MESSAGES: {
    chat: {
        convertToUrlButton: string;
        cli: string;
        facebook: string;
        slack: string;
        incomingGetRequest: string;
        incomingPostRequest: string;
        initWebhook: string;
        missingAppSecret: string;
        missingPageAccessToken: string;
        missingVerifyToken: string;
        noPageSubscriptionEvent: string;
        noUrlProvided: string;
        noWebsocketError: string;
        pageSubscriptionEvent: string;
        payloadNotVerified: string;
        responseTypeNotImplemented: string;
        sendingMessageToUser: string;
        unableToSendResponse: string;
        defaultConfiguration: string;
        webhookListening: string;
        webhookNotVerfied: string;
        webhookVerified: string;
        websocketError: string;
        unknownClient: string;
    };
    connections: {
        component: {
            database: string;
            websocket: string;
        };
        userConnectedTo: string;
    };
    core: {
        handleReceivedMessage: string;
        handleTextRequest: string;
        isFallbackIntent: string;
        noResponseNotPossible: string;
        scoreBelowThreshold: string;
        sendToNextAgent: string;
        transformToChatAdapterResponseError: string;
        unsupportedButtonError: string;
        unsupportedCustomPayloadError: string;
        couldNotStopCore: string;
    };
    database: {
        connectionUndefined: string;
        failedToConnect: string;
        userNotFoundOrCreatable: string;
    };
    initializeLogging: string;
    nlp: {
        adapter: {
            dialogflowAdapter: string;
            dialogflowV2Adapter: string;
            rasaAdapter: string;
        };
        contextCreated: string;
        deleteAllContexts: string;
        deleteSelectedContexts: string;
        moreThanOneResponse: string;
        sendTextRequest: string;
        setContexts: string;
        toNlpMessage: string;
        unableToAddContexts: string;
    };
    request: {
        text_request: string;
    };
    response: {
        action: string;
        after_action: string;
        agent: string;
        data: string;
        score: string;
    };
    textHandlingInit: string;
    unsupportedMessageType: string;
    warnings: {
        hash_mismatch: string;
        no_agents: string;
    };
};
export function setLogMessages(messages: typeof DEFAULT_LOG_MESSAGES): void;

export const logger: winston.Logger;

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
export type CliClientResponse = {
    readonly text: string;
    readonly id: string;
};
/**
 * This function is used to convert between the internal format and the format of the `CliClient`.
 *
 * @param response Response in the generalized framework format.
 * @returns Reponse in the `CliClient` format.
 *
 */
export function convertIntoCliClientResponse(
    response: ChatAdapterResponse,
): CliClientResponse;
/**
 * This function is used to setup a webhook that is compatible to the `CliClient`.
 * GET /WEBHOOK_PATH/hello: Used to tell the framework about the connection of a new user. This route generates a new
 *                          ID for that user and answers the user with the id.
 * POST /WEBHOOK_PATH     : This route handles text requests. Requests on this route are run through the processing
 *                          pipeline of the frameowrk and will end be sent to the NLP service through the `NLPAdapter`
 *                          depending on the type of message and configuration of the `Interceptor`s.
 *
 * @param handleRequest function that describes how the webhook should handle an incoming request.
 */
export function initWebhook(
    server: http.Server,
    app: express.Express,
    handleRequest: (
        request: CliClientRequest,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): void;

export function initWebhook(
    slackEvents: SlackEventAdapter,
    _handleRequest: (
        request: SlackRequest,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): Promise<void>;

export function initWebhook(
    server: http.Server,
    app: express.Express,
    handleRequest: (
        request: FacebookMessaging,
        messengerUserId: string,
    ) => Promise<Response<ChatAdapterResponse[]>>,
): void;

/**
 * This function is used to convert between the internal format and the format of the `CliClient`.
 *
 * @param message Messages in the format of the `CliClient`.
 * @returns Message in the generalized framework format.
 */
export function convertIntoChatAdapterRequest(
    message: CliClientRequest,
): ChatAdapterRequest;
export function convertIntoChatAdapterRequest(
    request: SlackRequest,
): ChatAdapterRequest;
/**
 * For more information regarding the setup:
 * see [CLI setup]{@link ../../_build/html/chat_adapter/cli_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class CliAdapter implements ChatAdapter {
    private readonly server;

    private readonly app;

    constructor();

    init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void>;

    deinit(): Promise<void>;

    contactClient(_: ChatAdapterResponse): Promise<void>;
}

/**
 * Transforms multiple generic NLP messages into an array of generic ChatAdapterResponses.
 *
 * @param nlpMessage Final message that should be sent to the user.
 * @param messengerUserId User identifier. Has to be depseudonymized at this point!
 * @returns Array that can be processed by a ChatAdapter.
 */
export function transformNlpResponseToChatAdapterResponse(
    nlpMessage: NlpResponse,
    messengerUserId: string,
): ChatAdapterResponse[];
/**
 * This function will be called if the processing is interrupted after the first interceptor (chatToCore). The
 * generic ChatAdapterRequest is directly transformed into a generic NlpResponse without sending it to an NLP service.
 * This means that the score and most other information is irrelevant, we only care about possible actions set
 * in the first interceptor.
 *
 * @param request An (interrupted) ChatAdapterRequest.
 * @param returns An `NlpResponse`.
 */
export function transformChatAdapterRequestResponseToNlpResponse(
    request: Response<ChatAdapterRequest>,
): NlpResponse;

type AgentWithName = Agent & {
    name: string;
};
/**
 * Get a sorted list of all configured agents.
 *
 * @returns an array of agents ordered descending with regards to their execution index.
 * Execution index: increasing index means decreasing importance. It is set in the config.
 */
export function getOrderedAgents(): AgentWithName[];
/**
 * More information regarding the usage of the interceptors can be found at
 * [Interceptor]{@link ../interfaces/Interceptor.html}
 */
export const chatToCore: Promise<Interceptor<
    ChatAdapterRequest,
    ChatAdapterRequest
>>;
export const nlpToNlp: Promise<Interceptor<NlpResponse, NlpResponse>>;
export const nlpToCore: Promise<Interceptor<NlpResponse, NlpResponse>>;

type NlpResponseData = {
    agentName: string;
    response: NlpResponse;
};

/**
 * Tries to find the best matching answer for an incoming request by the user. The message is sent to every
 * agent sorted by descending agent importance until a response with a high-enough score is returned. The
 * primary agent's answer servers as a fallback solution if no answer passes our scoring threshold.
 *
 * @param message Incoming TextRequest that should be processed.
 * @param primaryAgentResponse Answer from the first NLP agent. Will be used if no agent returns an answer
 *                             with a sufficient score.
 * @param index Index of the agent to whom the message will be sent.
 */
export function findBestNlpAnswerForTextRequest(
    message: ChatAdapterTextRequest,
    internalUserId: string,
    primaryAgentResponse?: NlpResponse | undefined,
    index?: number,
): Promise<NlpResponseData>;

/**
 * Used if no visible response should be sent to the user (e.g. if you only want to send a response with a
 * status code to the messaging platform). Use with care: Not sending a message usually confuses the user.
 * You might want to send `NoResponse` if you send another Response from your interceptor, especially a message
 * format not supported by the emubot framework.
 *
 * @param statusCode HTML status code sent back to the messenging platform.
 * @param userId User identifier. Has to already be depseudonymized!
 */
export function createNoResponse(
    statusCode: number,
    userId: string,
): NoResponse;
/**
 * Create a generic response of type T. Implies that the user should receive a visible response.
 *
 * @param payload Generic payload.
 * @param statusCode HTML status code sent back to the messaging platform.
 */
export function createResponse<T>(
    payload: T,
    statusCode: number,
    userId: string,
    interruptProcessing?: boolean,
    action?: string,
): Response<T>;

/**
 * Processes an incoming message, see [here]{@link ../../_build/html/core/core_overview.html} for more detailed information.
 *
 * @param request Message received from the user, already transformed into the generalized `ChatAdapterRequest`-type.
 * @returns An array of `ChatAdapterResponse`s with the content that should be sent to the user. The responses are wrapped
 *          in `Response`s. The wrapper does not contain any further information about what to send to the user, but provides
 *          information _if_ something should be sent to the user at all.
 */
export function handleReceivedMessageInCore(
    request: ChatAdapterRequest,
    messengerUserId: string,
): Promise<Response<ChatAdapterResponse[]>>;

export function initCore(): Promise<void>;
export function deinitCore(): Promise<void>;

/**
 * Transforms a message string and the `messengerUserId` into a `ChatAdapterResponse`.
 *
 * @param message The response that shall be sent to the user.
 * @param messengerUserId The depseudonymized userId.
 */
export function textToResponse(
    message: string,
    messengerUserId: string,
): ChatAdapterResponse;
/**
 * Helper to make sure that the messages are sent back to the messaging platform in the correct order.
 *
 * @param messageArray Messages that are sent to the user.
 * @param mappingFunction Function that shall be applied to each value.
 */
export function mapSerialized<T>(
    messageArray: T[],
    mappingFunction: (value: T) => Promise<unknown>,
): Promise<void>;

/**
 * Function to generate random user IDs.
 *
 * @returns a 20 byte random hex string which can be used as a user identifier.
 */
export function generateId(): string;

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

export function convertStringArrayToNlpContexts(
    contextNames: string[] | undefined,
    agentName: string,
): NlpContext[] | undefined;

/**
 * Deletes all contexts which are currently active for a certain agent. The context system is based on the
 * system used by Dialogflow. If you are using NLP backend that does not use a system like that you can just
 * ignore these requests. The requests will delete on the route `/deleteAllContexts` with the following JSON:
 * ```
 *  {
 *      user: string
 *  }
 * ```
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentName Used to define the agent whose contexts shall be deleted.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export function deleteAllContexts(
    internalUserId: string,
    agentName: string,
): Promise<NlpStatus>;

/**
 * Reset all contexts of a conversation.
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentToken Used to define the agent whose contexts shall be deleted.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export function deleteAllContexts(
    internalUserId: string,
    agentToken: string,
): Promise<NlpStatus>;

export function deleteAllContexts(
    internalUserId: string,
    projectId: string,
    agentToken: string,
): Promise<NlpStatus>;

/**
 * Deletes a list of contexts from the conversation. The context system is based on the system used by Dialogflow.
 * If you are using an NLP backend that does not use a context system you can just ignore these requests. The request
 * will delete on route `/deleteContexts` with the following JSON:
 * ```
 * {
 *   contexts: string[],
 *   user: string
 * }
 * ```
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentName Used to define the agent whose contexts shall be deleted.
 * @param contexts List of contexts that will be deleted from the conversation.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export function deleteSelectedContexts(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): Promise<NlpStatus>;

export function deleteSelectedContexts(
    internalUserId: string,
    agentToken: string,
    contexts: string[],
): Promise<NlpStatus>;

export function deleteSelectedContexts(
    internalUserId: string,
    projectId: string,
    agentToken: string,
    contexts: string[],
): Promise<NlpStatus>;

export type DialogflowStatus = {
    code: number;
    errorType: string;
    errorId?: string;
    errorDetails?: string;
};

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
    payload: {};
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
    text = 0,
    cards = 1,
    quickreplies = 2,
    image = 3,
    customPayload = 4,
}
export type DialogflowMessage =
    | DialogflowMessageQuickReplies
    | DialogflowMessageText
    | DialogflowMessageCard
    | DialogflowMessageImage
    | DialogflowMessageCustomPayload;

export type DialogflowContextResponse = {
    type: 'context';
    status: DialogflowStatus;
};

export function toNlpStatus(response: DialogflowContextResponse): NlpStatus;

export function toNlpStatus(response: DetectIntentResponse): NlpStatus;

/**
 * Posts a list of contexts to the NLP backend. The context system is based on the Dialogflow context system.
 * If the NLP backend that you are using does not use a context system you can just ignore these requests.
 * The request will then be sent to the route `/postContexts` and includes an JSON object with the following data:
 *
 * ```
 * {
 *   lifespan: number,
 *   contexts: string[],
 *   user: string
 * }
 * ```
 *
 * @param internalUserId The pseudonymized identifier which is used to define a session for a specific agent.
 * @param agentName Used to define the agent whose contexts shall be deleted.
 * @param contexts List of contexts that will be deleted from the conversation.
 *
 * @returns An `NlpStatus`, signaling whether the request was successful.
 */
export function postContexts(
    internalUserId: string,
    agentName: string,
    contexts: string[],
): Promise<NlpStatus>;

export function postContexts(
    internalUserId: string,
    contexts: string[],
    agentToken: string,
): Promise<NlpStatus>;

export function postContexts(
    internalUserId: string,
    agent: DialogflowAgent,
    contexts: string[],
): Promise<NlpStatus>;

export function sendTextRequest(
    textRequest: TextRequest,
    agentName: string,
): Promise<NlpResponse>;

export function sendTextRequest(
    textRequest: TextRequest,
    agentName: string,
    agentToken: string,
    url: string,
): Promise<NlpResponse>;

export function sendTextRequest(
    textRequest: TextRequest,
    projectId: string,
    agentToken: string,
    agentName: string,
): Promise<NlpResponse>;

export function sendTextRequest(
    textRequest: TextRequest,
    agentName: string | number,
): Promise<NlpResponse>;

/**
 * WARNING: The Dialogflow API version 1 will be deprecated soon. Migrate to version 2 and use the `DialogflowV2Adapter`.
 * Adapter for the [Dialogflow](https://dialogflow.com/) framework. This is an adapter for the Dialogflow API version 1.
 * Version 1 uses client and developer tokens to authenticate a user.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class DialogflowAdapter implements NlpAdapter {
    lifespanInMinutes: number;

    deleteAllContexts(
        this: DialogflowAdapter,
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextToDelete: string[],
    ): Promise<NlpStatus>;

    postContexts(
        this: DialogflowAdapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus>;

    sendSingleTextRequest(
        this: DialogflowAdapter,
        message: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}

export type DialogflowAgent = Agent & {
    project_id: string;
    defaultLifespan: number;
};
export type DialogflowAgents = {
    [key: string]: DialogflowAgent;
};
export interface DialogflowConfig extends NlpConfig<DialogflowAdapter> {
    agents: DialogflowAgents;
}

/**
 * Adapter for the [Rasa NLU](https://rasa.com/docs/rasa/) framework.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class RasaAdapter implements NlpAdapter {
    lifespanInMinutes: number;

    deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextToDelete: string[],
    ): Promise<NlpStatus>;

    postContexts(
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus>;

    sendSingleTextRequest(
        this: RasaAdapter,
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}

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

/**
 * Adapter for the [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/) framework.
 *
 * Given a phrase such as
 * ```
 *      What will the weather be like in paris at 9pm?
 * ```
 * Snips NLU will parse the query and answer with a result of the form:
 * ```
 * {
 * "intent": {
 *    "intentName": "searchWeatherForecast",
 *    "probability": 0.95
 * },
 * "slots": [
 *    {
 *        "value": "paris",
 *        "entity": "locality",
 *        "slotName": "forecastLocality"
 *    },
 *    {
 *        "value": {
 *        "kind": "InstantTime",
 *        "value": "2018-02-08 20:00:00 +00:00"
 *        },
 *        "entity": "snips/datetime",
 *        "slotName": "forecastStartDatetime"
 *    }
 *  ]
 * }
 * ```
 * If you want emubot to handle the messages which should be supplied to the user, you should add a `messages`
 * field into the parsed result. You can also add a `contexts` field if desired. The request to the Snips webhook
 * will also include an internalUserID which can be used to differentiate between users.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class SnipsAdapter implements NlpAdapter {
    lifespanInMinutes: number;

    deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextToDelete: string[],
    ): Promise<NlpStatus>;

    postContexts(
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus>;

    sendSingleTextRequest(
        this: SnipsAdapter,
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}

/**
 * Transforms the DialogflowV2-Response into the generalized format used in this framework.
 *
 * @param responseArray Message retrieved from the DialogflowV2 endpoint. Unclear why it
 *                      returns an array (contradicting documentation)
 * @param agentName Name of the agent the query was sent to. Specified as a key in your `config.ts`.
 */
export function toNlpTextResponse(
    responseArray: DetectIntentResponse[],
    agentName: string,
): NlpResponse;

export function toNlpTextResponse(
    response: DialogflowTextResponse,
    agentName: string,
): NlpResponse;

export function toNlpTextResponse(
    response: SnipsResponse,
    userMessage: string,
    agentName: string,
): NlpResponse;

export function toNlpTextResponse(
    parseResult: RasaParseResponse,
    userMessage: string,
    response: RasaTextResponse[],
    agentName: string,
): NlpResponse;

export function getAllContexts(
    agentName: string,
    internalUserId: string,
): Promise<void>;

/**
 * Adapter for the [Dialogflow](https://dialogflow.com/) framework. This is an adapter for Dialogflow API version 2.
 * Version 2 uses JSONs provided through Google Cloud Projects to authenticate the requests and has an updated response
 * format.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class DialogflowV2Adapter implements NlpAdapter {
    lifespanInMinutes: number;

    deleteAllContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    deleteSelectedContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus>;

    postContexts(
        this: DialogflowV2Adapter,
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus>;

    sendSingleTextRequest(
        this: DialogflowV2Adapter,
        message: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}

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
    attachments?: (
        | FacebookFallbackAttachment
        | FacebookLocationAttachment
        | FacebookUrlAttachment
    )[];
    sticker_id?: number;
};
export type FacebookUrlAttachment = {
    type: 'audio' | 'file' | 'image' | 'video';
    payload: {
        url: string;
        sticker_id?: number;
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

/**
 * The `IFacebookChatConfig` interface is required for authentication with Facebook. It includes:
 *
 * 1. `appSecret`: used to decrypt messages from Facebook to preserve the confidentiality.
 * 2. `version`: Version of the Facebook Graph API to which the request is sent to.
 * 3. `pageAccessToken`: Required for each application in the Facebook Developer Portal.
 *     For each page the application is integrated in, a different `pageAccessToken` has to be generated.
 * 4. `verifyToken`: Used to verify the communication between your server and a Facebook App.
 *     Set in the "Webhook" settings of the Facebook Developer Portal.
 *
 * The interface has to be implemented by the `FacebookAdapter`. For more information regarding the setup,
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/facebook_messenger.html}.
 *
 * @interface
 */
export interface FacebookChatConfig extends ChatConfig<FacebookAdapter> {
    version: string;
    pageAccessToken: string;
    verifyToken: string;
}

export type FacebookPostResponse = {
    recipient: {
        id: string;
    };
    message: FacebookMessage;
};
export type FacebookMessage =
    | FacebookTextMessage
    | FacebookQuickReplyMessage
    | FacebookAttachmentMessage;
export type FacebookTextMessage = {
    readonly text: string;
};
export type FacebookQuickReplyMessage = FacebookTextMessage & {
    quick_replies: FacebookQuickReply[];
};
export type FacebookQuickReply = FacebookTextQuickReply | OtherQuickReply;
export type FacebookTextQuickReply = {
    readonly content_type: 'text';
    readonly title: string;
    readonly payload: string;
    readonly image_url?: string;
};
type OtherQuickReply = {
    readonly content_type: 'location' | 'user_phone_number' | 'user_email';
    readonly title?: string;
    readonly payload?: string;
    readonly image_url?: string;
};
export type FacebookAttachmentMessage = {
    readonly attachment:
        | FacebookButtonAttachment
        | FacebookImageAttachment
        | FacebookGenericTemplate;
};
export type FacebookGenericTemplate = {
    readonly type: 'template';
    readonly payload: {
        readonly template_type: 'generic';
        readonly elements: [
            {
                readonly title: string;
                readonly image_url: string;
                readonly default_action: {
                    type: 'web_url';
                    url: string;
                };
            },
        ];
    };
};
export type FacebookButtonAttachment = {
    readonly type: 'template';
    readonly payload: {
        readonly template_type: 'button';
        readonly text: string;
        readonly buttons: FacebookButton[];
    };
};
export type FacebookImageAttachment = {
    readonly type: 'image';
    readonly payload: {
        readonly is_reusable?: boolean;
        readonly url: string;
        readonly sticker_id?: number;
    };
};
export type FacebookButton = FacebookPostbackButton | FacebookUrlButton;
export type FacebookPostbackButton = {
    readonly type: 'postback';
    readonly title: string;
    readonly payload: string;
};
export type FacebookUrlButton = {
    readonly type: 'web_url';
    readonly url: string;
    readonly title: string;
    readonly webview_height_ratio?: 'compact' | 'tall' | 'full';
    readonly messenger_extensions?: boolean;
    readonly fallback_url?: string;
    readonly webview_share_button?: string;
};
export {};

/**
 * Converts a message from the internal response format to a format that can be understood by the Facebook Messaging API.
 *
 * @param response Chat response using the internal generalized format.
 * @returns A message compatible with the Facebook format.
 */
export function convertToFacebookResponse(
    response: ChatAdapterResponse,
): FacebookMessage | undefined;

/**
 * From https://developers.facebook.com/docs/messenger-platform/reference/send-api/#recipient:
 * A successful Send API request returns a JSON string containing identifiers for the message and its recipient.
 * Note: Effective February 20, 2018, the Send API no longer includes recipient_id in the response for messages that use
 * `recipient.user_ref` or `recipient.phone_number` to identify the message recipient.
 */
export type FacebookResponseConfirmation = {
    recipient_id: string;
    message_id: string;
};

/**
 * Converts messages that use the internal format to responses that are compatible with the Facebook SEND API
 * and sends these to Facebook.
 *
 * @param responses Responses in the internal format.
 * @param messengerUserId Identification of the user to whom the message should be send.
 *                        The userId has to be depseudonymized at this point.
 */
export function sendMultipleResponses(
    responses: ChatAdapterResponse[],
    messengerUserId: string,
): Promise<void>;

/**
 * Converts a Facebook message into a generalized format which is used for further processing steps.
 * Currently supported types are:
 * 1. Standard `text` messages.
 * 2. `attachments` including files, audio, video, images.
 * All other message types (e.g. a transmitted `location` or other `template`s) are currently not directly supported and
 * combined in a `invalid` type. The payload (here: all information included in the message received) is added as a payload
 * in the `invalid` messages, you can thus still handle messages with formats that are not supported by the framework if you
 * use the first interceptor (`chatToCore`).
 *
 * @param message A message received from Facebook and thus includes Facebook-specific
 *                information. Information not required for further processing is discarded.
 * @returns A message in the generalized internal format.
 */
export function convertFacebookRequest(
    message: FacebookMessaging,
): ChatAdapterRequest;

/**
 * For more information regarding the setup:
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/facebook_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class FacebookAdapter implements ChatAdapter {
    private readonly server;

    private readonly app;

    constructor();

    init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void>;

    deinit(): Promise<void>;

    contactClient(response: ChatAdapterResponse): Promise<void>;
}

/**
 * Possible message types that are expected during the communication with the interceptors.
 * Each interceptor expects and returns a `BotFrameworkInterfaceMessage`.
 */
export type BotFrameworkInterfaceMessage = NlpResponse | ChatAdapterRequest;

/**
 * Defines the base class of MirrorInterceptors. A `MirrorInterceptor` takes a message from one of the three interfaces
 * and immediately returns it to the user without performing any additional operations and without changing the content
 * or any other external state.
 *
 * Using `MirrorInterceptor`s for all three interfaces is sufficient if you only want to let a user communicate with
 * your NLP Service. If you wish to perform additional actions (e.g. save information in a database or use information
 * from your CMS), you should implement your own interceptor. You can also have a look at some
 * [examples](https://github.com/emundo/emubot-extended-example/) of interceptors.
 *
 * More information regarding the usecases and which interceptors exist can be found at
 * [Interceptor]{@link ../interfaces/Interceptor.html}.
 */
export class MirrorInterceptor<T extends BotFrameworkInterfaceMessage>
    implements Interceptor<T, T> {
    /**
     * Used to create a new `MirrorInterceptor`-instance.
     */
    static getInstance<U extends BotFrameworkInterfaceMessage>(): Promise<
        MirrorInterceptor<U>
    >;

    handleMessage(userId: string, message: T): Promise<Response<T>>;
}

/**
 * Exemplar configuration of the Facebook adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Facebook]{@link ../../_build/html/chat_adapter/facebook.html} section of our documentation.
 */
export const platformChatFacebook: FacebookChatConfig;

/**
 * Exemplar configuration of the Dialogflow adapter (using version 2 of the Dialogflow API). If you are unsure which
 * information is required and how to retrieve it, take a look at the
 * [Dialogflow]{@link ../../_build/html/nlp_adapter/dialogflow.html} section of our documentation.
 */
export const platformNlpDialogflowV2: DialogflowConfig;

export const serverConfig: ServerConfig;

/**
 * Simple interceptor configuration. Interceptors are interceptors across the framework to manipulate messages or
 * perform further actions. These exemplar interceptors are only used to mirror an incoming message without further
 * modifications. You can write arbitrarily complex interceptors, for more information see
 * [here]{@link ../../_build/html/core/interfaces.html}.
 */
export const interceptorConfig: InterceptorConfig;

/**
 * IMPORTANT:
 * You can set your own configuration in order to start the framework using different chat platforms and NLP services.
 * If you do not provide a valid configuration the framework will start in the default configuration with the CLI
 * client as chat adapter.
 *
 * Uncomment the next three lines and change the path to your configuration file to start the framework with the adapters
 * of your choice.
 */

export type SlackRequest = SlackMessage;
export type SlackMessage = {
    type: 'message';
    channel: string;
    user: string;
    text: string;
    ts: string;
    blocks: any;
    ok: boolean;
    subtype?: string;
    event: {
        type: 'message';
        text: string;
        event_ts: string;
        user: string;
    };
};

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

export function convertToSlackResponse(
    response: ChatAdapterResponse,
    user: string,
    channel: string,
): SlackResponse;

/**
 * The `SlackConfig` interface is required for authentication with Facebook. It includes:
 *
 * 1. `appSecret`: A signing secret which verifies the challenge send by the Slack API
 *     For each page the application is integrated in, a different `pageAccessToken` has to be generated.
 * 4. `token`: Used to verify the communication between your server and your Slack workspace.
 *
 * The interface has to be implemented by the `SlackAdapter`. For more information regarding the setup,
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/slack.html}.
 *
 * @interface
 */
export interface SlackConfig extends ChatConfig<SlackAdapter> {
    token: string;
}

export function openChannel(userId: string): Promise<string>;
export function sendTextResponse(response: SlackResponse): Promise<void>;

export class SlackAdapter implements ChatAdapter {
    slackEvents: SlackEventAdapter;

    constructor();

    init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void>;

    deinit(): Promise<void>;

    contactClient(response: ChatAdapterResponse): Promise<void>;
}

/**
 * Exemplar configuration of the Rasa adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Rasa]{@link ../../_build/html/nlp_adapter/rasa.html} section of our documentation.
 */
export const platformNlpRasa: NlpConfig<RasaAdapter>;

/**
 * An exemplar configuration.
 * You can exchange elements (e.g. use Slack instead of Facebook) by using a different respective (messenger) configuration.
 */
export const config: Config<
    FacebookAdapter | SlackAdapter | CliAdapter,
    DialogflowV2Adapter | RasaAdapter | DialogflowAdapter | SnipsAdapter
>;

/**
 * Exemplar configuration of the Slack adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Slack]{@link ../../_build/html/chat_adapter/slack.html} section of our documentation.
 */
export const platformChatSlack: SlackConfig;

/**
 * Exemplar configuration of the CLI adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [CLI]{@link ../../_build/html/chat_adapter/cli.html} section of our documentation.
 * This configuration is used in case no chat configuration was provided and can be used in order to test the framework
 * via the CLI client.
 */
export const platformChatCli: ChatConfig<CliAdapter>;

/**
 * Exemplar configuration of the Dialogflow adapter (using version 1 of the Dialogflow API). If you are unsure which
 * information is required and how to retrieve it, take a look at the
 * [Dialogflow]{@link ../../_build/html/nlp_adapter/dialogflow.html} section of our documentation.
 *
 * IMPORTANT: Version 1 is deprecated and the documentation might be incomplete. Please consider switching to version 2.
 */
export const platformNlpDialogflow: DialogflowConfig;

/**
 * Exemplar configuration of the Snips adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Snips]{@link ../../_build/html/nlp_adapter/snips.html} section of our documentation.
 */
export const platformNlpSnips: NlpConfig<SnipsAdapter>;

/**
 * Typings for tests
 */
export const nlpMessageMap: Map<string, string[]>;

export class DummyNlpAdapter implements NlpAdapter {
    lifespanInMinutes: number;

    currentContextMap: Map<string, Map<string, string[]>>;

    constructor();

    deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextsToDelete: string[],
    ): Promise<NlpStatus>;

    postContexts(
        internalUserId: string,
        agentName: string,
        contextsToPost: string[],
    ): Promise<NlpStatus>;

    sendSingleTextRequest(
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}
export const platformDummyAdapter: NlpConfig<DummyNlpAdapter>;
export const SECRET: string;
export function createFacebookAdapter(): FacebookAdapter;
export function generateAppSecretProof(
    accessToken: string,
    clientSecret: string,
): string;
export function createFacebookServer(
    messageMap: Map<string, string>,
    users: Set<string>,
    clientSecret: string,
    version: string,
): http.Server;

export function createSlackAdapter(): SlackAdapter;
export function createSlackServer(
    messageMap: Map<string, string[]>,
    users: Set<string>,
): http.Server;
