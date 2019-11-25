import { config } from './configuration/configSlackDf2';
import { setConfig } from './core/getConfig';

/**
 * IMPORTANT:
 *
 * Setting the configuration using `setConfig(config)` before importing and calling `initCore()`
 * (used below) is currently REQUIRED to run your application since `setConfig(config)` specifies
 * your chatAdapter and nlpAdapter.
 */
setConfig(config);

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
