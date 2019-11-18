.. _custom_nlp_adapter:

Support Your NLP Platform
============================

If you want to add another NLP service, you will always need to implement the :code:`NlpAdapter` interface. You can skip this first section if you are
only interested in exemplar config files and the the technical definition of the format we expect. But first of all, we would like to offer some more explanation
of our inspiration that lead to the current decision-making process inside the framework. So let us start in the beginning

The program you communicate with over some messaging platform is what we call a chatbot. Behind this chatbot, there is a so called *agent*, which is often
used synonymous to *chatbot*. And this can be quite fitting: All the information (the definition of which queries shall be answered, which entities are relevant
to them, contextual information, exemplar utterances...) is saved in this agent. But a chatbot can also consist of several agents: especially for larger corporate
chatbots, it is often useful to divide the content (*separation of concern*) and introduce a hierarchy:
Answering smalltalk queries might be less relevant than answering questions regarding the service you offer. Furthermore you might deploy two chatbots, advising
on two different products. To avoid retraining the same smalltalk queries, you might want to keep them generalized and just plug your smalltalk agent into both
product-specific agents.

Using the framework you can create a hierarchy by using the :code:`executionIndex` to determine the order of when a request is sent to which agent, and set a
threshold which determines when to accept the response and not send it to another agent using a :code:`minScore`, the minimal confidence required to accept a result.
Commonly you want to be very certain when asking queries related to your product, which will also receive more training than e.g. smalltalk. This means that setting a
high :code:`minScore` for product specific agents and a lower one for smalltalk agents can be useful.


Configuration
~~~~~~~~~~~~~
In general, it is useful to extend the existing :code:`NlpConfig`. The :code:`NlpConfig` includes

1. a :code:`constructor` of the class that implemented :code:`NlpAdapter`,
2. a :code:`name` of the NLP service (used for logging), and
3. your :code:`Agents` where you define all information required for calling the NLP service API and parameters required for the hierarchy.

Your configuration file should also be extended with the platform-dependent authentication tokens and other variables required to communicate with the messaging API
of your service. Some of these information are part of the :code:`Agent` type. An agent includes the following information:

1. :code:`executionIndex`: a number to determine the order in which a request is sent to different agents. Only relevant if you use multiple agents, still mandatory to set.
   The agent with the lowest :code:`executionIndex` is called first.
2. :code:`minScore`: the default confidence that has to be exceeded to avoid sending the query to the next agent. Can be overwritten/ignored in the second
   `Inteceptor<interceptor>`, :code:`nlpToNlp`.
3. :code:`token`: token required to authenticate with your NLP service.
4. :code:`url`: the API endpoint you communicate with.
5. :code:`languageCode`: the language code of your agent. The format might differ between NLP services.

Depending on the platform you use, it might also be necessary to set other information like

1. :code:`project_id`: project ID of your agent (e.g. GCP ID for Dialogflow), or
2. the :code:`defaultLifespan` of your agents, defining how long a conversation context should last.
