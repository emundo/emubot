.. _fb_messenger:

Facebook Messenger
============================
This page will guide you through setting up a Facebook Messenger chatbot. You need to create a Facebook Application, a Facebook page (if you
do not already own one), and connect the Facebook Application with the page and your server.


Create a Facebook Application
-----------------------------
First of all, you have to create a Facebook Application. This application will manage the connection between your server and your Facebook page.
Head over to the `Facebook developer portal <https://developers.facebook.com/>`_, log in with your Facebook account and follow the required
steps to setup your profile. Then select ``Add New App`` and name your application. You will be forwarded to a dashboard and asked to add a
product. Choose the "Messenger" service and also add the "Webhooks" service (you can add more services by clicking on the "+" on the right panel).

Messenger service
~~~~~~~~~~~~~~~~~
Activating the Messenger service is required to connect your app to one or multiple Facebook pages. In the Messenger service, scroll to the
``Access Tokens`` section and add the Facebook page where you want to publish your bot. You might want to setup a test page during development.
If you do not already own a page, simply create a new one (``Create New Page``). Afterwards, generate a new **page access token** by clicking the
``Generate Token`` button that should be present in the ``Access Tokens`` section after adding your page. Save the page access token as you will
need it later on in your configuration file (see below).

Get an App Secret
~~~~~~~~~~~~~~~~~
Head over to the ``Settings -> Basic`` section of your Application. Here, you will see an ``App Secret`` field with a value which is hidden by
default. Select ``Show`` and save the App Secret.


Webhooks Service
~~~~~~~~~~~~~~~~
The webhook is required for the communication between your application and your webserver. After adding the Webhooks service to the products you
use, switch to its section and click on the ``Subscribe to this object`` button. You will be prompted to add some endpoint (e.g.
`https://www.url_of_your_server.com/webhook`) and a ``verify_token``, which is some string you can set freely. It will be used to verify the
communication between your server and your Facebook Application. Save this verify token. Now, you have to start the bot to continue. To do this,
add the tokens to your config file (see :ref:`exemplar_fb_config` below) and start the application on your server.

On your server: Make sure to redirect the traffic sent to `https://www.url_of_your_server.com/webhook` to the port your bot is
running on. Using Docker you could for example use a proxy, if you use an Apache Webserver, you might want to add a rewrite rule to your
``~/html/.htaccess``.

**Important**: You need to use https, i.e. have a valid TLS/SSL certificate configured. It is not possible to use self-signed certificates.

The running application is required to verify the webhook and you can not continue without setting the verify token! To run the application, you
have to set all of the tokens you just got, put the into the configuration file and start the bot.

.. _exemplar_fb_config:

Exemplar Facebook Config
------------------------
To start a chatbot on the Facebook Messenger, you have to already have created an agent (speak: chatbot) on a NLP platform (see e.g.
:ref:`exemplar_df_config`). Afterwards, you need to follow the steps above to obtain

1. The page access token: the page access token generally allows you to e.g. post messages in the name of your Facebook page.
2. The App Secret: used to verify the message payload.
3. The Verify Token: used to verify the webhook.

You can use an existing exemplar configuration file from our repository and change the values. Insert the App Secret, Page Access Token and
Verify Token, possibly modify your webhook (depending on what you have entered in the Webhooks section of your Facebook Application), and maybe
update the API version, depending on the Graph API version you use.

.. code-block:: javascript

    platform: {
                chat: {
                    appSecret: 'YOUR_APP_SECRET',
                    constructor: FacebookAdapter,
                    name: 'facebook',
                    pageAccessToken:
                        'process.env.YOUR_FACEBOOK_PAGE_TOKEN',
                    url: 'https://graph.facebook.com/',
                    verifyToken: 'process.env.YOUR_FACEBOOK_VERIFY_TOKEN',
                    version: 'v3.3',
                    webhook_path: '/webhook',
                },
                nlp {
                    ....

Compile the code using :code:`tsc` and run :code:`npm run start`.

Further Information Regarding the Setup
---------------------------------------
The application in its current form will only be accessible to invited testers. Public access requires a review through Facebook. To make your
bot accessible to all Facebook users, head over to the ``App Review`` section of your Facebook Application and follow the respective steps.

Supported Features
------------------
Due to the large amount of possible structures provided by Facebook, we have only implemented some of the most commonly used features. Most importantly
these are text messages, stickers and images. If we do not support some message type, we will declare it as invalid and pass the payload to the first
interceptor where you can alter the message and send an appropriate response.


Testing your Webhook
---------------------
The webhook API was adopted from `webhook-setup <https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup>`_ and
`webhook <https://developers.facebook.com/docs/messenger-platform/webhook>`_. The instructions below might be outdated, please consult these
websites if any errors occur.

You have created the webhook but something does not quite work?
Test the general functionality of your webhook:

1. Send a GET-Request to verify your webhook. The webhook requires 3 parameters:

    - hub.verify_token
    - hub.challenge
    - hub.mode=subscribe

    The challenge value is returned if all parameters are set correctly. Test it via

    1. Postman: Pass hub.verify_token, hub.challenge, hub.mode=subscribe along the GET-Request with ``http://localhost:<Port>/webhook``
    2. curl:

.. code:: bash

    curl -X GET "localhost:<Port>/webhook?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"

This request should return an ``Unauthorized`` error if the verify token is not set correctly and will answer with ``CHALLENGE_ACCEPTED`` otherwise.

2. POST-Request: Messages from the Facebook API have the following format: ``{"object": "page", "entry": message[]}`` Mandatory: messaging.sender.id
   and messaging.recipient.id. Test it:

    1.Postman: Send a POST-Request for ``http://localhost:<Port>/webhook`` with the JSON-body

.. code:: bash

    {
        "object": "page",
        "entry": [
            {
                "messaging": [
                    {
                        "sender": {
                            "id": "abc"
                        },
                        "recipient": {
                            "id": "def"
                        },
                        "message": {
                            "text": "TEST_MESSAGE"
                        }
                    }
                ]
            }
        ]
    }

The content of the JSON will change depending on the type of notifications Facebook sends to you.

    2. curl:

.. code:: bash

    curl -H "Content-Type: application/json" -X POST "localhost:<Port>/webhook" -d '{"object": "page", "entry": [{"messaging": [{"sender":{"id":"abc"},"recipient":{"id":"def"},"message":{"text":"TEST_MESSAGE"}}]}]}'

If you have correctly set up the webhook, this should return an ``EVENT_RECEIVED`` message.


.. warning::
    Do not forget to replace the ids, port and verify token.

