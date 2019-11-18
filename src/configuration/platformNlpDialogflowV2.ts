import { DialogflowV2Adapter } from '../nlp_adapter/dialogflowV2/DialogflowV2Adapter';
import { DialogflowConfig } from '../nlp_adapter/dialogflowV2/dialogflowConfig';

/**
 * Exemplar configuration of the Dialogflow adapter (using version 2 of the Dialogflow API). If you are unsure which
 * information is required and how to retrieve it, take a look at the
 * [Dialogflow]{@link ../../_build/html/nlp_adapter/dialogflow.html} section of our documentation.
 */
export const platformNlpDialogflowV2: DialogflowConfig = {
    agents: {
        my_first_agent: {
            defaultLifespan: 2,
            executionIndex: 0,
            languageCode: 'en-US',
            minScore: 0.8,
            project_id: 'GCP-ID-Project1',
            token: 'path/to/your/dialogflowApiToken1.json',
            url: '', // You do not need an endpoint url. This is provided by the Dialogflow dependency itself.
        },
        my_second_agent: {
            defaultLifespan: 2,
            executionIndex: 1,
            languageCode: 'en-US',
            minScore: 0.75,
            project_id: 'GCP-ID-Project2',
            token: 'path/to/your/dialogflowApiToken2.json',
            url: '', // You do not need an endpoint url. This is provided by the Dialogflow dependency itself.
        },
    },
    constructor: DialogflowV2Adapter,
    name: 'dialogflowV2',
};
