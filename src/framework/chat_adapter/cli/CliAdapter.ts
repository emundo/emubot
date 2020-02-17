import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Server, createServer } from 'http';
import { ChatAdapter } from '../IChatAdapter';
import { ChatAdapterRequest } from '../ChatAdapterRequest';
import { ChatAdapterResponse } from '../ChatAdapterResponse';
import { Response } from '../../core/model/Response';
import { initWebhook } from './communication/webhook';
import { convertIntoChatAdapterRequest } from './communication/convertCliClientRequest';
import { CliClientRequest } from './model/CliClientRequest';

/**
 * For more information regarding the setup:
 * see [CLI setup]{@link ../../_build/html/chat_adapter/cli_messenger.html}.
 * For more information regarding the functionality: see `ChatAdapter`.
 *
 * @implements {ChatAdapter}
 */
export class CliAdapter implements ChatAdapter {
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
            async (message: CliClientRequest) => {
                return handleRequest(
                    convertIntoChatAdapterRequest(message),
                    message.id,
                );
            },
        );
    }

    public async deinit(): Promise<void> {
        this.server.close();
    }

    public contactClient(_: ChatAdapterResponse): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
