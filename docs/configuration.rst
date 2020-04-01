.. _config_file:

Configuration file
==================

Central to your chatbot is its configuration file (which we will also call the *config*). In this file, you declare which messaging and NLP service you want to use and
include all information required to authenticate with the distinctive services.
You have to follow a predefined format specified in the `Typings <../api_reference/miscellaneous/typealiases.html#Agent>`_ of the framework.

**Important: Without a valid configuration file the framework will start in the default configuration. In default configuration the framework provides a simple communication test which is accessible through the** `CLI client <chat_adapter/cli_client.html>`_.

Basic structure
---------------
The minimum requirements necessary to start a bot are the specification of:

1. The variables required for the chat platform of your choice (:code:`config.platform.chat`).
2. The variables required for the NLP service of your choice (:code:`config.platform.nlp`).
3. The variables used to configure your server (:code:`config.server`).

Furthermore, you can add more configuration variables for additional services, like a database.

Exemplar Configuration File
---------------------------

In this exemplar configuration file, we use the `Facebook <https://www.facebook.com/>`_ Messenger as our messaging platform and `Dialogflow <https://dialogflow.com/>`_ as
our NLP Service. We have also provided some configuration files for various combinations of messaging platforms and NLP services
`here <https://github.com/emundo/emubot/tree/master/src/framework/configuration>`_. If you want to change the platforms, you can simply change the respective section (e.g. :code:`platform.chat`)
in the configuration file. More information on which variables you need for each platform and how you can get these variables can be found in the distinctive section
(see below for more information).

.. code-block:: javascript
   :emphasize-lines: 27,28,29,30,31,32,33,34,35
   :linenos:

    import {Config, FacebookAdapter, DialogflowV2Adapter} from 'emubot'

    export const config: Config<FacebookAdapter, DialogflowV2Adapter> = {
        platform: {
            chat: {
                appSecret: 'YOUR_APP_SECRET',
                constructor: FacebookAdapter,
                name: 'facebook',
                pageAccessToken:
                    'YOUR_FACEBOOK_PAGE_TOKEN',
                url: 'https://graph.facebook.com/',
                verifyToken: 'YOUR_FACEBOOK_VERIFY_TOKEN',
                version: 'v3.3',
                webhook_path: '/webhook',
            },
            nlp: {
                agents: {
                    name_of_first_agent: {
                        defaultLifespan: 2,
                        executionIndex: 1,
                        languageCode: 'de',
                        minScore: 0.75,
                        project_id: 'SOME_GCP_ID',
                        token: 'PATH_TO_SOME_TOKEN',
                        url: 'https://DIALOGFLOW-BASE-URL.com',
                    },
                    name_of_second_agent: {
                        defaultLifespan: 2,
                        executionIndex: 0,
                        languageCode: 'de',
                        minScore: 0.75,
                        project_id: 'ANOTHER_GCP_ID',
                        token: 'PATH_TO_ANOTHER_TOKEN',
                        url: 'https://DIALOGFLOW-BASE-URL.com',
                    },
                },
                constructor: DialogflowAdapter,
                name: 'dialogflow',
            },
        },
        server: {
            port: 61133, // The port your bot listens on.
        },
        interceptors: {
            chatToCore: MirrorInterceptor.getInstance,
            nlpToCore: MirrorInterceptor.getInstance,
            nlpToNlp: MirrorInterceptor.getInstance,
        }
    };

The second agent (the lines with the yellow background) is not necessarily required. We will talk about the use of this in the :ref:`config_nlp` section below.

Messaging Platform Configuration
--------------------------------
| If you want to use another chat platform (e.g. Slack):
| First of all, change the imported adapter. In our example change line 1 and 3 from

.. code-block:: javascript
    :emphasize-lines: 1,3
    :linenos:

    import {Config, FacebookAdapter, DialogflowV2Adapter} from 'emubot'

    export const config: Config<FacebookAdapter, DialogflowV2Adapter> = {
        platform: {
            ....

to

.. code-block:: javascript
    :emphasize-lines: 1,3
    :linenos:

    import {Config, SlackAdapter, DialogflowV2Adapter} from 'emubot'

    export const config: Config<SlackAdapter, DialogflowV2Adapter> = {
        platform: {
            ....

Then change the configuration itself. Which variables you require depends on the messaging platform you use.

Supported platforms currently are

1. Facebook: use :code:`FacebookAdapter`. For more information regarding the configuration, see :ref:`exemplar_fb_config`.
2. Slack: use :code:`SlackAdapter`. For more information regarding the configuration, see :ref:`exemplar_slack_config`.

If you want to support a different platform, take a look at :ref:`custom_nlp_adapter` and :ref:`custom_chat_adapter` respectively.

.. _config_nlp:

NLP Platform Configuration
--------------------------
| If you want to use another NLP platform (e.g. Rasa):
| Change the imported adapter and modify the respective variables. The changes are synonymous to the changes in the
  messaging platform above. Currently we support

1. Dialogflow (API version 1): use :code:`DialogflowAdapter` (deprecated).
2. Dialogflow (API version 2): use :code:`DialogflowV2Adapter`. For more information regarding the configuration, see :ref:`exemplar_df_config`.
3. Rasa: use :code:`RasaAdapter`. For more information regarding the configuration, see :ref:`exemplar_rasa_config`.
4. Snips: use :code:`SnipsAdapter`. For more information regarding the configuration, see :ref:`exemplar_snips_config`.

Multiple agents
---------------
Many chatbots are able to talk about different topics, e.g. perform smalltalk and offer an additional service that offers direct utility
(such as ordering a pizza). These topics can (and sometimes should) be separated into different *agents*. An agent
encompasses all the information required to fulfull user requests and is often also referred to simply as *the bot*.
But a bot as a whole can also include multiple agents, even if the user does not realize that different agents are
handling his requests. The :code:`emubot` framework allows you to send requests to multiple agents.

Each of your agents has an :code:`executionIndex`. The lower the index, the earlier a request will be sent to this agent.
The NLP service will then return a score between 0 and 1: If it is 100% sure that it can answer the query correctly,
it will return 1, otherwise it will return a value below 1. The higher the value, the higher is the confidence of the NLP service
that the query is classified correctly. This is why a :code:`minScore` is declared for each agent, which is a minimal threshold of
confidence the service has to have to accept the response and not ask a different agent.

Example for a :code:`minScore` of 0.6: If the NLU service returns a probability for an intent >0.6: use the intent.
If the probability is <0.6: send to next agent, determined by the `executionIndex`.

Best Practices
--------------
The tokens used to authenticate with the services are very senstive information.
You do not want to publish the respective strings or files in a public repository at any cost.
A good way to handle this is to use some CI/CD service (like `GitLab CI/CD <https://docs.gitlab.com/ee/ci/>`_) to assemble the respective files.

Furthermore, separating the configuration file into multiple individual blocks/files can help you. Using this allows you to reuse
the same configuration for a specific platform, which also means that you only have to change it in one place afterwards.


