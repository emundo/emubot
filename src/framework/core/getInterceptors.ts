import { getConfig } from './getConfig';
import { ChatAdapterRequest } from '../chat_adapter/ChatAdapterRequest';
import { Interceptor } from '../interceptors/Interceptor';
import { NlpResponse } from '../nlp_adapter/model/NlpAdapterResponse';

/**
 * More information regarding the usage of the interceptors can be found at
 * [Interceptor]{@link ../interfaces/Interceptor.html}
 */
export const chatToCore: Promise<Interceptor<
    ChatAdapterRequest,
    ChatAdapterRequest
>> = getConfig().interceptors.chatToCore();

export const nlpToNlp: Promise<Interceptor<
    NlpResponse,
    NlpResponse
>> = getConfig().interceptors.nlpToNlp();

export const nlpToCore: Promise<Interceptor<
    NlpResponse,
    NlpResponse
>> = getConfig().interceptors.nlpToCore();
