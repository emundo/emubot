import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Server, createServer } from 'http';
import { ChatAdapter } from '../IChatAdapter';
import { ChatAdapterResponse } from '../ChatAdapterResponse';
import { initWebhook } from './communication/webhook';
import { ChatAdapterRequest } from '../ChatAdapterRequest';
import { convertFacebookRequest } from './communication/convertRequest';
import { FacebookMessaging } from './model/FacebookPostRequest';
import { Response } from '../../core/model/Response';
import { sendMultipleResponses } from './communication/sendResponses';

/**
 * For more information regarding the setup:
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/facebook_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class FacebookAdapter implements ChatAdapter {
    private readonly server: Server;

    private readonly app: express.Express;

    constructor() {
        this.app = express().use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.server = createServer(this.app);
    }

    public async init(
        handleRequest: (
            message: ChatAdapterRequest,
            messengerUserId: string,
        ) => Promise<Response<ChatAdapterResponse[]>>,
    ): Promise<void> {
        initWebhook(
            this.server,
            this.app,
            async (message: FacebookMessaging) => {
                return handleRequest(
                    convertFacebookRequest(message),
                    message.sender.id,
                );
            },
        );
    }

    async deinit(): Promise<void> {
        this.server.close();
    }

    public contactClient(response: ChatAdapterResponse): Promise<void> {
        return sendMultipleResponses([response], response.messengerUserId);
    }
}
