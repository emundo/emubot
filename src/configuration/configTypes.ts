import { NlpAdapter } from '../nlp_adapter/INlpAdapter';
import { ChatAdapter } from '../chat_adapter/IChatAdapter';
import { NlpResponse } from '../nlp_adapter/model/NlpAdapterResponse';
import { Interceptor } from '../interceptors/Interceptor';
import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';

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
