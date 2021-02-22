import * as crypto from 'crypto';

import { OptionsWithUrl } from '../../../core/utils/responseUtils';
import { ChatAdapterResponse } from '../../ChatAdapterResponse';
import { convertToFacebookResponse } from './convertResponse';
import { LOG_MESSAGES } from '../../../constants/logMessages';
import { logger, getConfig } from '../../..';
import { FacebookMessage } from '../model/FacebookPostResponse';
import { FacebookResponseConfirmation } from '../model/FacebookResponseConfirmation';
import { FacebookChatConfig } from '../facebookConfig';
import { mapSerialized, postRequest } from '../../utils';

/**
 * Converts messages that use the internal format to responses that are compatible with the Facebook SEND API
 * and sends these to Facebook.
 *
 * @param responses Responses in the internal format.
 * @param messengerUserId Identification of the user to whom the message should be send.
 *                        The userId has to be depseudonymized at this point.
 */
export function sendMultipleResponses(
    responses: ChatAdapterResponse[],
    messengerUserId: string,
): Promise<void> {
    const convertedResponses: (FacebookMessage | undefined)[] = responses.map(
        convertToFacebookResponse,
    );

    return mapSerialized(convertedResponses, value =>
        value === undefined
            ? Promise.resolve()
            : sendResponse(value, messengerUserId).catch(error => {
                logger.error(
                    `${LOG_MESSAGES.chat.unableToSendResponse} ${error}`,
                );
                throw error;
            }),
    );
}

/**
 * Sends a single message to a user using the Facebook Messaging API.
 *
 * @param message Chat response in a format compatible with the Facebook Messaging API.
 * @param messengerUserId Identification of the user to whom the message should be send.
 *                        Has to be depseudonymized at this point.
 */
function sendResponse(
    message: FacebookMessage,
    messengerUserId: string,
): Promise<FacebookResponseConfirmation> {
    const requestConfig = createRequestConfiguration(message, messengerUserId);
    return postRequest(requestConfig) as Promise<FacebookResponseConfirmation>;

}

function createRequestConfiguration(
    message: FacebookMessage,
    messengerUserId: string,
): OptionsWithUrl {
    const facebookConfig = (getConfig().platform
        .chat as unknown) as FacebookChatConfig;
    const domain = facebookConfig.url;
    const version = facebookConfig.version;
    const accessToken = facebookConfig.pageAccessToken;
    const appSecretHash = getAppSecretProof(
        accessToken,
        facebookConfig.appSecret,
    );

    return {
        body: {
            message,
            messaging_type: 'RESPONSE',
            recipient: {
                id: messengerUserId,
            },
        },
        options: {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            json: true,
        },
        url: `${domain}${version}/me/messages?access_token=${accessToken}&appsecret_proof=${appSecretHash}`,
    };
}

function getAppSecretProof(accessToken: string, appSecret: string): string {
    const hmac = crypto.createHmac('sha256', appSecret || '');

    return hmac.update(accessToken).digest('hex');
}
