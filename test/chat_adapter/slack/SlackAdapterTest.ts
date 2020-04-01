import { should, expect } from 'chai';
import { Server } from 'http';
import { post, OptionsWithUrl } from 'request-promise-native';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { createHmac } from 'crypto';

import { openChannel } from '../../../src/framework/chat_adapter/slack/communication/webhook';
import { SlackAdapter } from '../../../src/framework/chat_adapter/slack/SlackAdapter';
import { generateId } from '../../../src//framework/core/utils/generateId';
import {
    ChatAdapterTextMessage,
    ChatAdapterResponse,
} from '../../../src/framework/chat_adapter/ChatAdapterResponse';
import { setConfig, getConfig } from '../../../src/framework/core/getConfig';
import { initCore, deinitCore } from '../../../src/framework/core/core';
import { SlackConfig } from '../../../src/framework/chat_adapter/slack/slackConfig';
import {
    Config,
    ChatConfig,
} from '../../../src/framework/configuration/configTypes';
import { interceptorConfig } from '../../../src/framework/configuration/interceptorConfig';
import { SlackMessage } from '../../../src/framework/chat_adapter/slack/model/SlackRequest';

import {
    DummyNlpAdapter,
    nlpMessageMap,
    platformDummyAdapter,
} from '../../_mocks/DummyNlpAdapter';
import {
    createSlackServer,
    createSlackAdapter,
} from './_mocks/_SlackTestServer';

chai.use(chaiAsPromised);

// The set of users is used as a mocked database containing known users.
const users: Set<string> = new Set();
const messageMap: Map<string, string[]> = new Map();
let server: Server;

// Generate pseudo users on mocked Slack server.
function generateUserId(): string {
    const userId: string = generateId();
    users.add(userId);

    return userId;
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

describe('Slack', () => {
    before(() => {
        // Random ID as secret with each test call.
        const SECRET: string = generateId();
        const platformChatSlack: ChatConfig<SlackAdapter> = {
            appSecret: SECRET,
            constructor: SlackAdapter,
            name: 'slack',
            url: 'http://localhost:4000/',
            webhook_path: 'webhook',
        };

        const config: Config<SlackAdapter, DummyNlpAdapter> = {
            interceptors: interceptorConfig,
            platform: {
                chat: platformChatSlack,
                nlp: platformDummyAdapter,
            },
            server: {
                port: 4001,
            },
        };
        server = createSlackServer(messageMap, users);
        setConfig(config);
    });

    beforeEach(() => {
        users.clear();
        messageMap.clear();
    });

    after(() => {
        server.close();
    });

    describe('openChannel()', () => {
        it('Valid openChannel() request should respond with a channel id.', async () => {
            const userId = generateUserId();
            const channel: string = await openChannel(userId);
            should().equal(channel, 'X');
        });

        it('openChannel() request should return an error if userId is not known by the server.', async () => {
            const channel: string = await openChannel('XXXX');
            should().equal(channel, '');
        });
    });

    describe('contactClient()', () => {
        let adapter: SlackAdapter;

        beforeEach(() => {
            adapter = createSlackAdapter();
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
            should().exist(messageMap.has(userId));
            expect((messageMap.get(userId) as string[]).includes('Hello')).to.be
                .true;
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

            await adapter.contactClient(resp);
            should().exist(messageMap.has(userId));
        });
    });

    function computeSlackSignature(ts: number, body: SlackMessage): string {
        const hmac = createHmac('sha256', getConfig().platform.chat.appSecret);
        const version = 'v0';
        hmac.update(`${version}:${ts}:${JSON.stringify(body)}`);

        return hmac.digest('hex');
    }

    function createRequestConfiguration(
        text: string,
        user: string,
        channel: string,
    ): OptionsWithUrl {
        const requestTimestamp = Date.now();
        const body: SlackMessage = {
            channel,
            text: '',
            user,
            subtype: 'user_message',
            type: 'message',
            ok: true,
            ts: `${requestTimestamp}`,
            blocks: undefined,
            event: {
                type: 'message',
                user: user,
                event_ts: `${requestTimestamp}`,
                text: text,
            },
        };

        const slackSignature = computeSlackSignature(requestTimestamp, body);

        return {
            body: body,
            headers: {
                'X-Slack-Signature': `v0=${slackSignature}`,
                'X-Slack-Request-Timestamp': requestTimestamp,
                Accept: 'application/json',
                Authorization: `Bearer ${
                    (getConfig().platform.chat as SlackConfig).token
                }`,
                'Content-Type': 'application/json',
            },
            json: true,
            url: `http://localhost:4001/slack/events`,
        };
    }

    describe('init()/deinit()', () => {
        it('Deinit should correctly stop the chat adapter internal server.', async () => {
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

        it('Contacting emubot with a valid userMessage should result in a valid response.', async () => {
            const userId = generateUserId();
            const channel = generateId();
            const request: OptionsWithUrl = createRequestConfiguration(
                'oneResponse',
                userId,
                channel,
            );
            post(request);
            // Slack expects to have an answer after at most 2 seconds
            await sleep(100);
            should().exist(messageMap.has(userId));
        });

        it('Multiple responses should be retrieved and then posted to the server in the correct order.', async () => {
            const userId = generateUserId();
            const channel = generateId();
            const request: OptionsWithUrl = createRequestConfiguration(
                'multipleResponses',
                userId,
                channel,
            );
            post(request);
            await sleep(100); // Slack expects to have an answer after at most 2 seconds.

            it('Multiple (all) messages retrieved from server', async () => {
                should().exist(messageMap.has(userId));
                should().exist(nlpMessageMap.has(userId));
            });

            it('Messages were posted to slack server in correct order', async () => {
                const nlpMessages = nlpMessageMap.get(userId) as string[];
                const messages = messageMap.get(userId) as string[];
                for (let i = 0; i < nlpMessageMap.size; i++) {
                    should().equal(nlpMessages[i], messages[i + 1]);
                }
            });
        });

        afterEach(async () => {
            await deinitCore();
        });
    });
});
