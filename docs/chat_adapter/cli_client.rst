
.. _cli_messenger:

CLI Client Adapter
============================
The CLI client is a tool to quickly test the functionality of the emubot framework without the need to combine it with one of the 
available chat options. This means that you can test the framework itself or a new NLP Adapter, without having to setup a server 
and certificate for the chat platform.
You can only use text requests and only return texts as well. You cannot send images or other attachments.

Exemplar CLI Config
------------------------
You can start using the CLI client by providing your own CLI config as shown in the example below. Note that the example assumes
that you have already created a NLP agent on some platform (for an example of an NLP configuration, see :ref:`exemplar_df_config`).

.. code-block:: javascript

    platform: {
                chat: {
                    appSecret: '',
                    constructor: CliAdapter,
                    name: 'cli',
                    url: '',
                    webhook_path: '/webhook'
                },
                nlp {
                    ....

Compile the code (:code:`npm run tsc`) and run :code:`npm run start`. This will start the framework in the CLI client configuration
You can also achieve this by not providing a configuration to the framework, in which case the framework will start with
the CLI client adapter. Note that by not providing a configuration, the framework will use a dummy NLP handler. In `bin/`
we have provided a `cli.ts` node script which represents the client part to the CLI adapter. You can start this script
by compiling (:code:`npm run tsc`) and simply running :code:`node /dist/bin/cli.js`. This will provide you with a simple CLI prompt
where you can enter your messages that will be send to the emubot framework. The CLI will also show you the response of the framework
and with the `--verbose` option you can force it to show you the complete response send by the framework. The emubot framework is able
to two message types for CLI messages as of now: `CliClientInitialMessage` and `CliClientMessage`. The first type is just a way to let the
framework know that a new user wants to communicate with the framework. The second type are messages with text that should be handled
by the core and sent to the NLP adapter (although you can of course interrupt this process within the interceptors).

The `CliClientInitialMessage` type is defined as:

.. code:: bash

    POST /hello
        {
            type: 'initial';
            id: string;
        };


The  `CliClientMessage` type is defined as:

.. code:: bash

    POST /
        {
            type: 'message';
            text: string;
            id: string;
        };


The framework will answer with a `CliClientResponse` of the form

.. code:: bash

    {
        text: string;
        id: string;
    }


Of course you can also use the adapter in order to connect your own messaging application if you support this format.
You can simply send post requests to the respective webhook.