import * as express from 'express';
import * as http from 'http';
import { json } from 'body-parser';
import * as cors from 'cors';
import { createHmac } from 'crypto';
import { FacebookAdapter } from '../../../../src/framework/chat_adapter/facebook/FacebookAdapter';
import { generateId } from '../../../../src/framework/core/utils/generateId';

const facebookMessageRoute = '/me/messages';

export const SECRET: string = generateId();

export function createFacebookAdapter(): FacebookAdapter {
    return new FacebookAdapter();
}

export function generateAppSecretProof(
    accessToken: string,
    clientSecret: string,
): string {
    const hmac = createHmac('sha256', clientSecret);

    return hmac.update(accessToken).digest('hex');
}

export function createFacebookServer(
    messageMap: Map<string, string>,
    users: Set<string>,
    clientSecret: string,
    version: string,
): http.Server {
    const PORT = 4003;

    const app = express().use(json());
    app.use(cors({ origin: '*' }));

    const server: http.Server = http.createServer(app);
    app.post(`/${version}${facebookMessageRoute}`, (req, res) => {
        const SIGNING_SECRET = generateAppSecretProof(
            req.query.access_token,
            clientSecret,
        );
        if (!((req.query.appsecret_proof as string) === SIGNING_SECRET))
            res.sendStatus(400);
        if (!users.has(req.body.recipient.id)) res.sendStatus(404);
        else {
            messageMap.set(req.body.recipient.id, req.body.message.text);
            res.sendStatus(200);
        }
    });

    server.listen(PORT, () => undefined);

    return server;
}
