.. _quickstart:

Quickstart
============================
| Setting up a bot using this framework is designed to be simple, especially if you have already worked with one of the supported chat platforms and NLP services.
  Please consult the :ref:`overview` section if you need more information regarding the respective components of a chatbot.

| :code:`emubot` allows the deployment of a chatbot on various platforms. To get started, you have to modify your :ref:`config_file` to determine the messaging and
  NLP services you want to use. If you want to include a platform that is currently not supported by this framework, you can implement an adapter by yourself (see
  :ref:`custom_chat_adapter` and :ref:`custom_nlp_adapter` respectively).
| To use the framework you have to install :code:`npm`, which is automatically shipped with Node.js. If you do not already have Node.js installed on your system,
  simply follow `these steps to install it <https://www.npmjs.com/get-npm>`_. After having installed Node.js, you can currently choose between three different exemplar
  setups with different (dis-)advantages to test the :code:`emubot` framework. Each of these examples has a guide on how to setup the chatbot in its respective repository!

1. `Minimal example <https://github.com/emundo/emubot-minimal-example/>`_: Uses the :code:`emubot` npm package. This is mainly to test setups for yourself and should
   not be used in production, because the user identification is not further disguised by default.
2. `Extensive example <https://github.com/emundo/emubot-extended-example/>`_:  Uses the :code:`emubot` npm package. This repository includes more advanced functionality
   (see :ref:`interceptors`) like databases and pseudonymization by default.
3. Cloning the `repository from GitHub <https://github.com/emundo/emubot/>`_ and starting it. Recommended if you want to apply changes to the framework itself.
