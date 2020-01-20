import { CliAdapter } from '../chat_adapter/cli/CliAdapter';
import { ChatConfig } from './configTypes';

/**
 * Exemplar configuration of the CLI adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [CLI]{@link ../../_build/html/chat_adapter/cli.html} section of our documentation.
 * This configuration is used in case no chat configuration was provided and can be used in order to test the framework
 * via the CLI client.
 */
export const platformChatCli: ChatConfig<CliAdapter> = {
    appSecret: '',
    constructor: CliAdapter,
    name: 'cli',
    url: '',
    webhook_path: '/webhook',
};
