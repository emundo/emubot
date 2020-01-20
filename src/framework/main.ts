/**
 * IMPORTANT:
 * You can set your own configuration in order to start the framework using different chat platforms and NLP services.
 * If you do not provide a valid configuration the framework will start in the default configuration with the CLI
 * client as chat adapter.
 *
 * Uncomment the next three lines and change the path to your configuration file to start the framework with the adapters
 * of your choice.
 */
// import { config } from './path/to/your/configuration';
// import { setConfig} from './core/getConfig';
// setConfig(config);

/**
 * The strings used for logging (LOG_MESSAGES) or messaging the user (MESSAGES) can be changed by
 * the user. To do this, simply use the respective setters:
 *
 * Logging:
 * import { setLogMessages } from '. /constants/logMessages';
 * import { yourNewLogFile } from './constants/yourLogFile';
 * setLogMessages(yourNewLogFile);
 *
 * Messaging:
 * import { setMessages } from './constants/messages';
 * import { yourNewMessagesFile } from './constants/yourMessagingFile';
 * setMessages(yourNewMessagesFile);
 */

import { initCore } from './core/core';

initCore();
