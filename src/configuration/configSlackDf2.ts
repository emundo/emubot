import { interceptorConfig } from './interceptorConfig';
import { SlackAdapter } from '../chat_adapter/slack/SlackAdapter';
import { DialogflowV2Adapter } from '../nlp_adapter/dialogflowV2/DialogflowV2Adapter';
import { platformNlpDialogflowV2 } from './platformNlpDialogflowV2';
import { platformChatSlack } from './platformChatSlack';
import { serverConfig } from './serverConfig';
import { Config } from './configTypes';

/**
 * An exemplar configuration using Slack and DialogflowV2.
 * You can exchange elements (e.g. use Facebook instead of Slack) by using a different respective (messenger) configuration.
 */
export const config: Config<SlackAdapter, DialogflowV2Adapter> = {
    interceptors: interceptorConfig,
    platform: {
        chat: platformChatSlack,
        nlp: platformNlpDialogflowV2,
    },
    server: serverConfig,
};
