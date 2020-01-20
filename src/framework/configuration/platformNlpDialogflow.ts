import { DialogflowAdapter } from '../nlp_adapter/dialogflow/DialogflowAdapter';
import { DialogflowConfig } from '../nlp_adapter/dialogflowV2/dialogflowConfig';

/**
 * Exemplar configuration of the Dialogflow adapter (using version 1 of the Dialogflow API). If you are unsure which
 * information is required and how to retrieve it, take a look at the
 * [Dialogflow]{@link ../../_build/html/nlp_adapter/dialogflow.html} section of our documentation.
 *
 * IMPORTANT: Version 1 is deprecated and the documentation might be incomplete. Please consider switching to version 2.
 */
export const platformNlpDialogflow: DialogflowConfig = {
    agents: {
        first_agent: {
            defaultLifespan: 2,
            executionIndex: 0,
            project_id: '', //Not required for V1, can be left empty.
            languageCode: 'en',
            minScore: 0.75,
            token: 'YOUR_DIALOGFLOW_TOKEN_FROM_AGENT_1',
            url: 'https://api.dialogflow.com/v1/query?v=20150910',
        },
        second_agent: {
            defaultLifespan: 2,
            executionIndex: 1,
            project_id: '', //Not required for V1, can be left empty.
            languageCode: 'en',
            minScore: 0.5,
            token: 'YOUR_DIALOGFLOW_TOKEN_FROM_AGENT_2',
            url: 'https://api.dialogflow.com/v1/query?v=20150910',
        },
    },
    constructor: DialogflowAdapter,
    name: 'dialogflow',
};
