.. _core_overview:

Core
============================

Here, we describe how an incoming message is processed. If you are only interested in the interfaces used to manipulate a message and alter states, the interceptors,
please take a look at :ref:`interceptors`.

The core is responsible for the logic that processes a new message upon receival. The message processing itself will begin in your chat adapter. The chat adapter
is only used to manage API calls to and from a messaging platform, verifying the message content or webhook and transforming the message. This transformation means
that an incoming message is stripped of (for our purpose unnecessary) information and metadata and converted into a generalized format used internally in the
framework. As soon as the core receives such a generalized incoming message, it is send to the first interceptor, :ref:`chatTocore`. Here you can manipulate the
message (content as well as user identifier) or perform additional actions, such as saving data in a database. After this and every other interceptor, the workflow
can be interrupted (returning some response or no response to the user) or continued. We will focus on the workflow used to process the most common case of message:
text messages. Take a look at :ref:`interceptors` for more information regarding the functionality of other use cases and how to properly handle a message at the
interceptor.

After the first interceptor has returned a text message, it is passed to the Nlp Adapter of your choice which sends the message to the agent with the highest
:code:`executionIndex` (see :ref:`custom_nlp_adapter`). The :code:`executionIndex` has to be set by you as the chatbot operator in the configuration.
Afterwards, the second interceptor, :ref:`nlpTocore`, is called where you can interrupt the default decision strategy of our framework and perform actions like
call the NLP service API to e.g. delete a context of an agent. Afterwards the usual decision-making process is further executed and the
response is wrapped in a generalized framework format. Once again an interceptor is called and external actions (calling another API, saving data, depseudonymizing
a message,..) are performed before returning the message to the chat adapter which sends it to the messaging platform.

Using a generalized format, it can happen that additional information from the initial message is required (e.g. if a user sends his location using Facebook
which is encapsuled in an additional parameter). To keep the framework slim and focusing on the most important use cases, we have decided against supporting
all possible types for now. Please issue a pull request if you think that an existing type is incorrect or if it should be extended. Types that are not supported
are put into an `invalid` message and can be handled in the first interceptor. The whole payload is part of such a message, so that you can decide what to do with
the message at the first interceptor.
