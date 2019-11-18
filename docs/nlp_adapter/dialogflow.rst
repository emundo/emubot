.. _dialogflow:

Dialogflow
============================
Dialogflow (formerly known as api.ai) is an NLP service offered by Google. Dialogflow version 1 has used developer and client access tokens to authorize access.
The support for this authorization method will soon be replaced completely and they only Dialogflow version 2 will be supported , where you have to authorize
using tokens provided by Google Cloud Projects. The following instructions will only cover the Dialogflow version 2 authentication, since version 1 will be
deprecated soon (even though :code:`emubot` still supports Dialogflow version 1).

Setting Up A Dialogflow Agent
--------------------------------
To setup a chatbot you have to create an agent, i.e. an entity that includes the knowledge of your bot. Head over to the
`Dialogflow console <https://dialogflow.cloud.google.com/>`_, create an agent and fill it with some content (take a look at their
`docs <https://cloud.google.com/dialogflow/docs/>`_). Go to the settings of your agent (the cogwheel symbol on the left) and follow the link to your service
account. Select the correct service account, click the three dots on the right (below ``Actions``) to create a new key (``Create Key --> JSON``). Download the JSON
file and save it somewhere where it is accessible by the configuration file.

.. _exemplar_df_config:

Exemplar Dialogflow Configuration
---------------------------------
After downloading the authentication file you can setup your configuration.
You can use an existing configuration file and simply alter the values. The structure is as follows:

.. code-block:: javascript

    export const platformNlpDialogflowV2 = {
        agents: {
            first_agent: {
                defaultLifespan: 2,
                executionIndex: 1,
                languageCode: 'de',
                minScore: 0.75,
                project_id: 'GCP-ID',
                token: 'path/to/authenticationfile.json',
                url: 'https://www.DIALOGFLOW-ENDPOINT-URL.com/',
            },
        },
        constructor: DialogflowV2Adapter,
        name: 'dialogflowV2',
    };

The ``url`` is not required for dialogflow version 2 since we will use the dialogflow dependency. The language codes can be found in the dialogflow docs.
More information regarding the :code:`executionIndex` and :code:`minScore` can be found at :ref:`custom_nlp_adapter`.

