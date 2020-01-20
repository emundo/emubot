import { BotFrameworkInterfaceMessage } from './BotFrameworkInterfaceMessage';
import { createResponse } from '../core/utils/responseUtils';
import { Response } from '../core/model/Response';
import { Interceptor } from './Interceptor';

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
    public static async getInstance<
        U extends BotFrameworkInterfaceMessage
    >(): Promise<MirrorInterceptor<U>> {
        return Promise.resolve(new MirrorInterceptor<U>());
    }

    public handleMessage(userId: string, message: T): Promise<Response<T>> {
        return Promise.resolve(createResponse(message, 200, userId));
    }
}
