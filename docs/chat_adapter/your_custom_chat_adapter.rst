.. _custom_chat_adapter:

Support Your Chat Platform
==========================

As of now, we have published adapters for Facebook and Slack. And while we work on adding more adapters, the fastest and best way to support the
platform of your choice is to write your own custom adapter. Each adapter for a new chat platform has to implement the interface :code:`ChatAdapter`.
If you are not entirely sure how to implement it, take a look at the existing adapters. The implemented interface will require some tokens that
should be included in your configuration file.

Configuration
~~~~~~~~~~~~~
In general, it is useful to extend the existing :code:`ChatConfig`. The :code:`ChatConfig` includes

1. a :code:`constructor` of the class that implemented :code:`ChatAdapter`,
2. a :code:`name` of the messaging platform (used for logging),
3. the :code:`url` of the messaging API with which you communicate, and
4. the internal :code:`webhook` path to which a messaging API sends its requests.

Your configuration file should also be extended with the platform-dependent authentication tokens and other variables required to communicate with
the messaging API of your service.

Some Advice
~~~~~~~~~~~

1. Make sure to throw (meaningful) errors when necessary.