import { NlpResponse } from '../nlp_adapter/model/NlpAdapterResponse';
import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';

/**
 * Possible message types that are expected during the communication with the interceptors.
 * Each interceptor expects and returns a `BotFrameworkInterfaceMessage`.
 */
export type BotFrameworkInterfaceMessage = NlpResponse | ChatAdapterRequest;
