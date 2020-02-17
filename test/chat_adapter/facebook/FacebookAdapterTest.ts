import { should } from 'chai';
import { Server } from 'http';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { post, OptionsWithUrl } from 'request-promise-native';

import { FacebookChatConfig } from '../../../src/framework/chat_adapter/facebook/facebookConfig';
import { generateId } from '../../../src/framework/core/utils/generateId';
import { FacebookAdapter } from '../../../src/framework/chat_adapter/facebook/FacebookAdapter';
import { getConfig } from '../../../src/framework/';
import { Config } from '../../../src/framework/configuration/configTypes';
import { interceptorConfig } from '../../../src/framework/configuration/interceptorConfig';
import { initCore, deinitCore, setConfig } from '../../../src/framework/';
import {
    ChatAdapterTextMessage,
    ChatAdapterResponse,
} from '../../../src/framework/chat_adapter/ChatAdapterResponse';
import {
    FacebookMessaging,
    FacebookPostRequest,
    Entry,
} from '../../../src/framework/chat_adapter/facebook/model/FacebookPostRequest';

import {
    createFacebookServer,
    createFacebookAdapter,
} from './_mocks/_FacebookTestServer';
import {
    DummyNlpAdapter,
    platformDummyAdapter,
} from '../../_mocks/DummyNlpAdapter';

chai.use(chaiAsPromised);

const messageMap: Map<string, string> = new Map();
const users: Set<string> = new Set();
let server: Server;

// Generate pseudo users on the side of the mocked Facebook Server
function generateUserId(): string {
    const userId: string = generateId();
    users.add(userId);

    return userId;
}

function createRequestConfiguration(
    text: string,
    user: string,
): OptionsWithUrl {
    const recipient: string = generateId();
    const requestTimestamp = Date.now();
    const messageId: string = generateId();

    const message: FacebookMessaging = {
        sender: {
            id: user,
        },
        recipient: {
            id: recipient,
        },
        timestamp: `${requestTimestamp}`,
        message: {
            is_echo: false,
            mid: messageId,
            text: text,
        },
    };

    const entries: Entry[] = [
        {
            id: generateId(),
            time: requestTimestamp,
            messaging: [message],
        },
    ];

    const body: FacebookPostRequest = {
        entry: entries,
        object: 'page',
    };

    return {
        body: body,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        json: true,
        url: `http://localhost:${getConfig().server.port}${
            getConfig().platform.chat.webhook_path
        }`,
    };
}

describe('Facebook adapter', () => {
    before(() => {
        // Random ID as secret with each test call.
        const SECRET: string = generateId();
        const ACCESS_TOKEN: string = generateId();
        const VERIFY_TOKEN: string = generateId();
        const VERSION = 'v3.3';
        const platformChatFacebook: FacebookChatConfig = {
            appSecret: SECRET,
            constructor: FacebookAdapter,
            name: 'facebook',
            pageAccessToken: ACCESS_TOKEN,
            url: 'http://localhost:4003/',
            verifyToken: VERIFY_TOKEN,
            version: VERSION,
            webhook_path: '/webhook',
        };
        const config: Config<FacebookAdapter, DummyNlpAdapter> = {
            interceptors: interceptorConfig,
            platform: {
                chat: platformChatFacebook,
                nlp: platformDummyAdapter,
            },
            server: {
                port: 4002,
            },
        };
        server = createFacebookServer(messageMap, users, SECRET, VERSION);
        setConfig(config);
    });

    beforeEach(() => {
        users.clear();
        messageMap.clear();
    });

    after(() => {
        server.close();
    });

    describe('contactClient()', () => {
        let adapter: FacebookAdapter;
        beforeEach(() => {
            adapter = createFacebookAdapter();
        });

        it('Contacting client with the message "Hello" should correctly reach the server.', async () => {
            const text: ChatAdapterTextMessage = {
                type: 'text',
                text: 'Hello',
            };
            const userId = generateUserId();
            const resp: ChatAdapterResponse = {
                Message: text,
                messengerUserId: userId,
            };

            await adapter.contactClient(resp);
            should().equal(messageMap.get(userId), 'Hello');
        });

        it('Contacting invalid userID should result in no message.', async () => {
            const text: ChatAdapterTextMessage = {
                type: 'text',
                text: 'Hi',
            };
            const userId = generateId();
            const resp: ChatAdapterResponse = {
                Message: text,
                messengerUserId: userId,
            };
            await adapter.contactClient(resp).should.be.rejected;
        });
    });
    describe('init()/deinit()', () => {
        it('Deinit should correctly stop the chat adapter internal server', async () => {
            await initCore();
            await deinitCore().should.be.fulfilled;
            await initCore();
            await deinitCore().should.be.fulfilled;
        });
    });
    describe('handleRequest()', () => {
        beforeEach(async () => {
            await initCore();
        });

        it('Contacting Botframework with valid userMessage should result in valid response', async () => {
            const userId = generateUserId();
            const request: OptionsWithUrl = createRequestConfiguration(
                'hey',
                userId,
            );
            await post(request).should.eventually.be.fulfilled;
        });

        afterEach(async () => {
            await deinitCore();
        });
    });
});
