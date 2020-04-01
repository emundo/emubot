.. _slack:

Slack
============================
This page will help you set up a Slack chatbot. In order to integrate
a chatbot into your Slack channel you first need to create a channel,
a Slack app and a bot user. Then you need to add the bot user to a workspace
and set up the event handling for the bot. All this information is taken from
the Slack API documentation, specifically the section about
`bot users <https://api.slack.com/bot-users>`_. For more information please
refer directly to the Slack documentation.

Creating a Slack App
--------------------
Following the `bot users <https://api.slack.com/bot-users>`_ guide you can
simply click on the ``Create new app`` button in order to start your new app.
Name it and assign a workspace and you are good to go. You should now see
multiple new setup options.

Creating a Bot User
-------------------
Having created your app the next step is to add a bot user. The bot user will
be part of your workspace, where you and your co-workers can proceed to
interact with it. Creating a bot user is also very easy, simply select your new
app by clicking on the `Your Apps` button on the top right. Open the
`Add features and functionality` menu. In the menu you will see a button titled
`Bots`. Clicking the button creates a bot user.


App Credentials
---------------
In order to use the Slack adapter of the :code:`emubot` framework with your new
Slack bot you will need to provide some app credentials. You can find the
credentials by clicking on the ``Your Apps`` button of the Slack API
documentation and selecting your app. If you scroll down you should see the app
credentials. :code:`emubot` needs the ``Signing Secret``, which you should
put in the `appSecret` field of your Slack-configuration. Please take a look at
the :ref:`exemplar_slack_config` section for instructions on how to setup the
correct configuration for :code:`emubot`.


Subscribing to Events
---------------------
Return to the menu where you have created the bot user. Here, you can also add
a webhook path in order to combine your new bot user with your server. Simply
click on the ``Event Subscriptions`` button and add your request URL in the text
field. Note that Slack will immediately send a request containing a challenge to
the URL in order to verify it. You should make sure that your bot is running with
the correct credentials. Your request URL will be verified if everything is
configured correctly and you should be good to go. Otherwise, check whether :code:`emubot`
is up and running on the correct URL.

.. _exemplar_slack_config:

Exemplar Slack Config
------------------------
To start :code:`emubot` with the Slack adapter you will need to provide a
valid platform configuration file. Assuming you have already setup a NLP
agent (see :ref:`exemplar_df_config`), the configuration should look
like this:


.. code-block:: javascript

    export const platformChatSlack: ChatConfig<SlackAdapter> = {
        appSecret: 'YOUR-SLACK-APP-SECRET',
        token: 'YOUR_SLACK_OAUTH_TOKEN',
        constructor: SlackAdapter,
        name: 'slack',
        url: 'https://slack.com/api/chat.postMessage',
        webhook_path: '/webhook',
    };

After you have saved the configuration file you can simply compile the program
(using :code:`npm run tsc`) and run the bot with :code:`npm run start`.

Supported Features
------------------
Note that :code:`emubot` will only deal with text messages from Slack as of
yet. All other messages must be handled in the first interceptor and will be
ignored otherwise.


Testing Your Setup
------------------
If you have followed the instructions you should have a running :code:`emubot`
instance accesible through a request URL, which you have provided to your Slack
app. If the request URL got verified by Slack you should be good to go. In your
Slack workspace you should now see your created bot user and you should also be
able to start a conversation with your bot.
