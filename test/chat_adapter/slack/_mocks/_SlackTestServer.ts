import * as express from 'express';
import * as http from 'http';
import { json } from 'body-parser';
import * as cors from 'cors';
import { SlackAdapter } from '../../../../src/framework/chat_adapter/slack/SlackAdapter';
import { generateId } from '../../../../src/framework/core/utils/generateId';
import {
    SlackOpenChannelResponse,
    SlackErrorResponse,
} from '../../../../src/framework/chat_adapter/slack/model/SlackResponse';

const slackMessageRoute = '/chat.postMessage';
const slackOpenChannelRoute = '/im.open';

export const SECRET: string = generateId();

export function createSlackAdapter(): SlackAdapter {
    return new SlackAdapter();
}

export function createSlackServer(
    messageMap: Map<string, string[]>,
    users: Set<string>,
): http.Server {
    const PORT = 4000;

    const app = express().use(json());
    app.use(cors({ origin: '*' }));

    const server: http.Server = http.createServer(app);

    app.post(slackMessageRoute, (req, res) => {
        let newMessages: string[] = [];
        if (messageMap.has(req.body.user)) {
            newMessages = messageMap.get(req.body.user) as string[];
        }
        newMessages.push(req.body.text);
        messageMap.set(req.body.user, newMessages);
        res.sendStatus(200);
    });

    app.post(slackOpenChannelRoute, (req, res) => {
        if (users.has(req.body.user)) {
            const resp: SlackOpenChannelResponse = {
                ok: true,
                channel: {
                    id: 'X',
                },
            };
            res.send(resp);
        } else {
            const resp: SlackErrorResponse = {
                ok: false,
                error: 'invalid_auth',
            };
            res.send(resp);
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    server.listen(PORT, () => {});

    return server;
}
