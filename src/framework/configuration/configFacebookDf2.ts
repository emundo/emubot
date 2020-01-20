import { Config } from './configTypes';
import { FacebookAdapter } from '../chat_adapter/facebook/FacebookAdapter';
import { DialogflowV2Adapter } from '../nlp_adapter/dialogflowV2/DialogflowV2Adapter';
import { platformChatFacebook } from './platformChatFacebook';
import { platformNlpDialogflowV2 } from './platformNlpDialogflowV2';
import { serverConfig } from './serverConfig';
import { interceptorConfig } from './interceptorConfig';

/**
 * An exemplar configuration using Facebook and DialogflowV2.
 * You can exchange elements (e.g. use Slack instead of Facebook) by using a different respective (messenger) configuration.
 */
export const config: Config<FacebookAdapter, DialogflowV2Adapter> = {
    interceptors: interceptorConfig,
    platform: {
        chat: platformChatFacebook,
        nlp: platformNlpDialogflowV2,
    },
    server: serverConfig,
};
