.. _snips:

Snips
============================
Snips is a speech recognition API provided by the Snips company.
The main focus of Snips is to provide an on-device voice recognition platform,
which allows developers to design Private-by-Design voice assistants, where the
data never leaves the device. As such they focus on voice recognition
algorithms which can run on small hardware. As part of their voice
recognition pipeline they use Snips NLU, an open source NLU API provided as a
Python package. In order to integrate a Snips NLU agent into :code:`emubot`
you need to provide a server to which the framework can adress its requests.


Setting Up a Snips Agent
-------------------------
The first steps in creating your Snips bot will follow the
`Snips NLU documentation <https://snips-nlu.readthedocs.io/en/latest/index.html>`_.
In order to use the Snips NLU you can must first install the package using
`pip`:

.. code-block:: bash

    pip install snips-nlu

you will also need to download language resources for the languages you want
your bot to use.

.. code-block:: bash

    python -m snips_nlu download <language>

Afterwards you should be good to go and can follow along the lines of the
`Snips NLU tutorial <https://snips-nlu.readthedocs.io/en/latest/tutorial.html>`_
to define and train your bot.
Snips NLU does not provide a server by default. :code:`emubot ` provides
a simple test server based on the `Flask <https://github.com/pallets/flask>`_
web application framework, which you can adapt to your needs. Your server
should provide a POST route for the following request:

.. code-block:: bash

    POST /parse

This request will include the following JSON:

.. code-block:: javascript

    {
        message_id: string,
        text: string,
        token: string
    }

where `message_id` is a user id that will allow you to keep track of different
conversations. The `text` field is the actual text you will need to parse with
the Snips NLU engine and `token` is the token you provide as part of the
:code:`emubot` configuration, and which can be used to authenticate the requests.

The expected response conforms to the format of a Snips NLU parse result

.. code-block:: javascript

    {
        intent: {
            intentName: string,
            probability: number
        },
        slots: {
            [
                {
                    value: string,
                    entity: string,
                }
            ]
        }
    }

By default the Snips NLU does not provide answers to your messages so if you
want to provide your users with a text response to their requests you can
include a `messages` field to the server response. Our framework will send
these messages to the user as part of the response.

.. code-block:: javascript

    {
        intent: {
            intentName: string,
            probability: number
        },
        slots: {
            [
                {
                    value: string,
                    entity: string,
                }
            ]
        },
        messages: [string],
        action: string,
        contexts: [string]
    }

.. _exemplar_snips_config:

Exemplar Snips Configuration
---------------------------------
Here you can see an example for a configuration of a Snips agent.

.. code-block:: javascript

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
