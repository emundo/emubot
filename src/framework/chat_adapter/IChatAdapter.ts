import { ChatAdapterRequest } from './ChatAdapterRequest';
import { ChatAdapterResponse } from './ChatAdapterResponse';
import { Response } from '../core/model/Response';

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
     * Required to send a message to the client outside of the usual workflow.
     *
     * The way this is implementated can vary. You could e.g. use a websocket or, if allowed by the messaging platform,
     * directly post to the respective API.
     *
     * @param response A `ChatAdapterResponse` with the content that should be sent to the user.
     */
    contactClient(response: ChatAdapterResponse): Promise<void>;
}
