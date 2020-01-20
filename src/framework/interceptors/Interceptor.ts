import { Response } from '../core/model/Response';

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
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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
