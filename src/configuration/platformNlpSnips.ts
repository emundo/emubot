import { SnipsAdapter } from '../nlp_adapter/snips/SnipsAdapter';
import { NlpConfig } from './configTypes';

/**
 * Exemplar configuration of the Snips adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Snips]{@link ../../_build/html/nlp_adapter/snips.html} section of our documentation.
 */
export const platformNlpSnips: NlpConfig<SnipsAdapter> = {
    agents: {
        snips_test: {
            executionIndex: 0,
            languageCode: 'en',
            minScore: 0.8,
            token: 'your_secret token',
            url: 'https://www.url-to-your-server.com',
        },
    },
    constructor: SnipsAdapter,
    name: 'snips',
};
