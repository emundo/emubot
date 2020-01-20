/**
 * @module emubot
 */

export { setConfig, getConfig } from './core/getConfig';
export { adapter } from './core/getAdapter';
export { initCore } from './core/core';

export { logger } from './logger';
export { setLogMessages, LOG_MESSAGES } from './constants/logMessages';

export { createResponse, createNoResponse } from './core/utils/responseUtils';
export { textToResponse } from './chat_adapter/utils';
export { generateId } from './core/utils/generateId';

export { RasaAdapter } from './nlp_adapter/rasa/RasaAdapter';
export { SnipsAdapter } from './nlp_adapter/snips/SnipsAdapter';
export { DialogflowV2Adapter } from './nlp_adapter/dialogflowV2/DialogflowV2Adapter';
export { DialogflowAdapter } from './nlp_adapter/dialogflow/DialogflowAdapter';
export { FacebookAdapter } from './chat_adapter/facebook/FacebookAdapter';
export { CliAdapter } from './chat_adapter/cli/CliAdapter';

export { MirrorInterceptor } from './interceptors/MirrorInterceptor';
export * from './configuration/configTypes';
