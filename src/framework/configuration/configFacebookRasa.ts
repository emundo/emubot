import { Config } from './configTypes';
import { FacebookAdapter } from '../chat_adapter/facebook/FacebookAdapter';
import { RasaAdapter } from '../nlp_adapter/rasa/RasaAdapter';
import { platformChatFacebook } from './platformChatFacebook';
import { platformNlpRasa } from './platformNlpRasa';
import { serverConfig } from './serverConfig';
import { interceptorConfig } from './interceptorConfig';

/**
 * An exemplar configuration using Facebook and Rasa.
 * You can exchange elements (e.g. use Slack instead of Facebook) by using a different respective (messenger) configuration.
 */
export const config: Config<FacebookAdapter, RasaAdapter> = {
    interceptors: interceptorConfig,
    platform: {
        chat: platformChatFacebook,
        nlp: platformNlpRasa,
    },
    server: serverConfig,
};
