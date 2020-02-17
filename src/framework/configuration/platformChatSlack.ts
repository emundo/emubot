import { SlackAdapter } from '../chat_adapter/slack/SlackAdapter';
import { SlackConfig } from '../chat_adapter/slack/slackConfig';

/**
 * Exemplar configuration of the Slack adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Slack]{@link ../../_build/html/chat_adapter/slack.html} section of our documentation.
 */
export const platformChatSlack: SlackConfig = {
    appSecret: 'YOUR_SLACK_SECRET',
    token: 'YOUR_SLACK_OAUTH_TOKEN',
    constructor: SlackAdapter,
    name: 'slack',
    url: 'https://slack.com/api/',
    webhook_path: '/webhook',
};
