import { Config } from '../configuration/configTypes';
import { ChatAdapter } from '../chat_adapter/IChatAdapter';
import { NlpAdapter } from '../nlp_adapter/INlpAdapter';

let config: Config<ChatAdapter, NlpAdapter>;

/**
 * Convenience function to provide access to the current configuration.
 *
 * @returns The current configuration.
 */
export function getConfig(): Config<ChatAdapter, NlpAdapter> {
    return config;
}

/**
 * Function that sets a provided configuration file. Please note that the emubot framework can not change the
 * configuration while it is already running. Calling this function while the emubot framework is running will
 * lead to unexpected behaviour.
 *
 * @param userConfig Configuration with which to run the emubot framework.
 */
export function setConfig(userConfig: Config<ChatAdapter, NlpAdapter>): void {
    config = userConfig;
}

/**
 * Avoid current circular dependencies. Will be reworked in the next update.
 */

export function getPort(): number {
    return config.server.port;
}
