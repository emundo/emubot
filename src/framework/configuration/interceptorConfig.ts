import { InterceptorConfig } from './configTypes';
import { MirrorInterceptor } from '../interceptors/MirrorInterceptor';

/**
 * Simple interceptor configuration. Interceptors are interceptors across the framework to manipulate messages or
 * perform further actions. These exemplar interceptors are only used to mirror an incoming message without further
 * modifications. You can write arbitrarily complex interceptors, for more information see
 * [here]{@link ../../_build/html/core/interfaces.html}.
 */
export const interceptorConfig: InterceptorConfig = {
    chatToCore: MirrorInterceptor.getInstance,
    nlpToCore: MirrorInterceptor.getInstance,
    nlpToNlp: MirrorInterceptor.getInstance,
};
