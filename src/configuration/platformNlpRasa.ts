import { RasaAdapter } from '../nlp_adapter/rasa/RasaAdapter';
import { NlpConfig } from './configTypes';

/**
 * Exemplar configuration of the Rasa adapter. If you are unsure which information is required and how to retrieve it,
 * take a look at the [Rasa]{@link ../../_build/html/nlp_adapter/rasa.html} section of our documentation.
 */
export const platformNlpRasa: NlpConfig<RasaAdapter> = {
    agents: {
        rasa_test: {
            executionIndex: 0,
            languageCode: 'en',
            minScore: 0.5,
            token: 'your_secret_token',
            url: 'http://localhost:5005',
        },
    },
    constructor: RasaAdapter,
    name: 'rasa',
};
