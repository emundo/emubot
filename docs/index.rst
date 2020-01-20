Welcome to the :code:`emubot` Framework
===============================================

| :code:`emubot` aims to enable users with little coding experience as well as users with extensive experience that want to quickly set up a flexible and
  transparent chatbot. This documentation is complementary to our `GitHub repository <https://github.com/emundo/emubot/>`_ and describes the setup for various
  messaging platforms and natural language processing (NLP) services. Currently, we support two messaging services (Facebook and Slack) as well as three NLP
  services (Dialogflow, Rasa and Snips) out of the box. Adding adapters for :ref:`another, also your very own, chat platform <custom_chat_adapter>` or
  :ref:`another NLP service <custom_nlp_adapter>` is designed to be easy.

| If you do not know how chatbots work, want to know which components are relevant, or if you want to know what our architecture looks like,
 you might want to start in the :ref:`overview` section.
| The :ref:`quickstart` guide offers all information required to get up and running.
| Feel free to :ref:`contact` us if you would like to :ref:`contribute` another adapter to this framework!

.. toctree::
   :maxdepth: 1
   :caption: Overview

   quickstart
   overview
   configuration

.. .. toctree::
   :maxdepth: 1
   :hidden:
   :caption: Setup and Hosting


   setup/docker
   setup/hosting
   setup/database

.. toctree::
   :maxdepth: 1
   :caption: Chat Adapters

   chat_adapter/facebook_messenger
   chat_adapter/slack
   chat_adapter/cli_client
   chat_adapter/your_custom_chat_adapter

.. toctree::
   :maxdepth: 1
   :caption: Core

   core/core_overview
   core/interfaces

.. toctree::
   :maxdepth: 1
   :caption: NLP platforms

   nlp_adapter/dialogflow
   nlp_adapter/snips
   nlp_adapter/rasa
   nlp_adapter/custom_nlp_adapter

.. toctree::
   :caption: API

   api

.. toctree::
   :maxdepth: 1
   :caption: Miscellaneous

   contribute
   about_us

