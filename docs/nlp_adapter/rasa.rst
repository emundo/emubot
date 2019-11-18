.. _rasa:

Rasa
============================
Rasa is an open source NLU provider that is distributed as an Python API,
developed and provided by Rasa Technologies. Different from other closed
source providers like Dialogflow, you will need to host your own server
in order to use Rasa. This will pose several challenges and is not as
easy to integrate into the framework as other agents, where you simply have
to provide a valid configuration to the configuration file and are good to go.
One major advantage of hosting your own server is that you do not have
to share any of your data with another company.
Here we will quickly introduce how you can setup :code:`emubot` using Rasa.

Setting Up a Rasa Agent
-----------------------
You can install the Rasa API as a `pip` package by using the following
command:

 .. code-block:: bash

     pip3 install rasa-x --extra-index-url https://pypi.rasa.com/simple

After you have installed the Rasa API you can follow
`Rasa tutorial <https://rasa.com/docs/rasa/user-guide/rasa-tutorial/>`_ to
define your own Rasa bot. After you have done so you can use the provided Rasa
commands to train your bot and start a test server:

.. code-block:: bash

    rasa train
    rasa run --enable-api -m path/to/trained/model

The example Rasa server will start on port 5000 by default. The framework
uses the HTTP API provided with the server as a reference for its
implementation. If you want to use your own server between the
framework and Rasa, you should provide the following two routes for the
requests from the framework:

.. code-block:: bash

    POST /model/parse

This route parses the provided text using your model.

.. code-block:: javascript

    {
        message_id: string,
        sender: 'user',
        text: string,
        token: string
    }


The response is expected to include the following fields:

.. code-block:: javascript

    {
        entities: [
            {
                value: string,
                entity: string,
            }
        ],
        intent: {
            confidence: number,
            name: string
        },
    }

Where entities and intent are conform with the Rasa parse results.

You can also add the following fields in order to give additional information
to your interceptors:

.. code-block:: javascript

    {
        entities: [
            {
                value: string,
                entity: string,
            }
        ],
        intent: {
            confidence: number,
            name: string
        },
        action: string,
        contexts: [string]
    }


.. code-block:: bash

    POST /webhooks/rest/webhook

This route parses the provided text with your trained Rasa model.

.. code-block:: javascript

    {
        message: string,
        message_id: string,
        token: string,
    }

The result of the request is the answer of the Rasa agent:

.. code-block:: javascript

    {
        "text": string
    }

Note that :code:`emubot` will also add the token you provide in the
configuration to the requests. You can use this token as an API token for
your server.

Of course you can include any number of other information in your responses,
which you can then use to trigger events in the implementation of your
:ref:`interceptors`. But you should make sure to pass the information to the
:code:`emubot` framework.

These requests have to conform to the definition in the
`Rasa HTTP API <https://rasa.com/docs/rasa/api/http-api/>`_. Head over to
their docs for more information.

.. _exemplar_rasa_config:

Exemplar Rasa Configuration
---------------------------

In this section you can see an example for a Rasa configuration to be used in
the :code:`emubot` framework.

.. code-block:: javascript

    export const platformNlpRasa = {
        agents: {
            first_agent: {
                defaultLifespan: 2,
                executionIndex: 1,
                languageCode: 'en',
                minScore: 0.75,
                token: env.NLP_TOKEN,
                url: 'https://my-cool-rasa-bot.com/',
            },
        },
        constructor: RasaAdapter,
        name: 'rasa',
    };
