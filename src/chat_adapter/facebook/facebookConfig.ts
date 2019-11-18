import { ChatConfig } from '../../configuration/configTypes';
import { FacebookAdapter } from './FacebookAdapter';

/**
 * The `IFacebookChatConfig` interface is required for authentication with Facebook. It includes:
 *
 * 1. `appSecret`: used to decrypt messages from Facebook to preserve the confidentiality.
 * 2. `version`: Version of the Facebook Graph API to which the request is sent to.
 * 3. `pageAccessToken`: Required for each application in the Facebook Developer Portal.
 *     For each page the application is integrated in, a different `pageAccessToken` has to be generated.
 * 4. `verifyToken`: Used to verify the communication between your server and a Facebook App.
 *     Set in the "Webhook" settings of the Facebook Developer Portal.
 *
 * The interface has to be implemented by the `FacebookAdapter`. For more information regarding the setup,
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/facebook_messenger.html}.
 *
 * @interface
 */
export interface FacebookChatConfig extends ChatConfig<FacebookAdapter> {
    version: string;
    pageAccessToken: string;
    verifyToken: string;
}
