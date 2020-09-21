import { platformChatCli } from './platformChatCli';
import { platformNlpDialogflowV2 } from './platformNlpDialogflowV2';

import { serverConfig } from './serverConfig';
import { interceptorConfig } from './interceptorConfig';
import { Config } from './configTypes';
import { DialogflowV2Adapter } from '../nlp_adapter/dialogflowV2/DialogflowV2Adapter';
import { CliAdapter } from '..';

/**
 * An exemplar configuration using Facebook and DialogflowV2.
 * You can exchange elements (e.g. use Slack instead of Facebook) by using a different respective (messenger) configuration.
 */
export const config: Config<CliAdapter, DialogflowV2Adapter> = {
    interceptors: interceptorConfig,
    platform: {
        chat: platformChatCli,
        nlp: platformNlpDialogflowV2,
    },
    server: serverConfig,
};
