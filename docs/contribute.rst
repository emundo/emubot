.. _contribute:

Contribute
============================
Thank you for being interested in contributing!

Contribution Guidelines
~~~~~~~~~~~~~~~~~~~~~~~
Please mind a few conventions if you would like to contribute:

1. Language: English
2. Naming: Common TypeScript style (see e.g. `this styleguide <https://basarat.gitbooks.io/typescript/docs/styleguide/styleguide.html>`_). This especially means:

    1. Functions, files and variables: lowerCamelCase. Example: :code:`function myFunction(parameterOne: string, parameterTwo: number)`
    2. Directories: snake_case. Example: :code:`src/chat_adapter`
    3. Classes: PascalCase. Example: :code:`class DialogflowAdapter{}`
    4. Constants: All caps, words separated by underscores. Example: :code:`public readonly PI = 6;`
    5. Lists: Do not the plural, but ``All`` or ``List``. Example:  ``response[]`` is called ``allResponse`` or ``responseList``, not (!) ``responses``)
    6. Sphinx Documentation (variables, files, directories): snake_case

2. Strings that might be visible to the user have to be imported from ``src/constants/messages.ts``
3. Strings that are used for logging have to be imported from ``src/constants/logMessages.ts``


How to contribute
~~~~~~~~~~~~~~~~~

1. Install Git (e.g. ``apt install git`` on Ubuntu).
2. Fork this repository on GitHub.
3. Clone your repository: ``git clone https://github.com/your_username/emubot.git``.
4. Edit the code and make sure that everything just runs fine (compile it using ``tsc``).
5. Revisit the change (via ``git status``), add the changed files (e.g. ``git add file_that_was_changed``), commit them (``git commit -m"meaningful commit message"`` and push the changes to your GitHub repository (``git push``)).
6. Create a new pull request  from your repository the official emubot repository.
7. We will revisit the changes and

    1. Accept your changes,
    2. Will suggest changes,
    3. Or reject your pull request if we think that it does not fit the framework.


.. _possible_extensions:

Possible Extensions
~~~~~~~~~~~~~~~~~~~

To avoid rejection of code into which you have already put quite some effort, make sure that we have listed the feature here.
If it is not listed, but if it would still be a good addition in your opinion, feel free to message us!
A small overview of possible extensions, if you would like to contribute, but do not know where to start:

1. Additional Chat Adapters: Add support for other chat platforms, like...

    - Google Chat
    - Kik
    - Telegram
    - Skype

2. Additional NLP services: Add support for other NLP platforms, like...

    - `Microsoft LUIS <https://www.luis.ai>`_
    - `Amazon Lex <https://aws.amazon.com/lex/>`_

3. Small guides for the setup using different hosting platforms (e.g. Google Cloud), Webserver (e.g. Nginx) or similar

Core to the flexibility of the framework are not only the adapters for different platforms of communication, but also the versatile usage of our interfaces between the communication.
The repository offers some core examples, e.g. additional support for e.g. :ref:`pseudonymization`. There are many functionalities that can be easily incorporated into this framework.
If you think that you have an interesting and common example, feel free to reach out and we will add it to the list of our examples!
If you are not sure how an adapter should look like, just take a look at existing adapters.

Do you have any further questions or would you like to cooperate with us? Feel free to reach out to us at emubot@e-mundo.de.