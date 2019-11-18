import { SlackAdapter } from './SlackAdapter';
import { ChatConfig } from '../../configuration/configTypes';

/**
 * The `SlackConfig` interface is required for authentication with Facebook. It includes:
 *
 * 1. `appSecret`: A signing secret which verifies the challenge send by the Slack API
 *     For each page the application is integrated in, a different `pageAccessToken` has to be generated.
 * 4. `token`: Used to verify the communication between your server and your Slack workspace.
 *
 * The interface has to be implemented by the `SlackAdapter`. For more information regarding the setup,
 * see [Facebook setup]{@link ../../_build/html/chat_adapter/slack.html}.
 *
 * @interface
 */

export interface SlackConfig extends ChatConfig<SlackAdapter> {
    token: string;
}
