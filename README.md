# emubot - eMundo Bot Framework

This framework aims to offer an easy way to develop and deploy chatbots, reducing the overhead in code by using standardized components, allowing a high degree of exchangeability. The easy setup also enables less experienced developers to build and deploy a chatbot. Different messaging platforms (like Facebook Messenger, Slack or your personal website) can be used interchangeably to communicate with a user, and requests can be classified and answered using different natural language processing (NLP) services like Dialogflow, Snips or Rasa, depending on your personal need. Changing a platform does not influence the logic in the background, meaning that you only have to change very few lines of code to change from one platform to another while maintaining the same functionality. Further, the separation of concerns makes it simple to include further functionality like automated speech recognition.

Separating the different components is especially useful to preserve and protect the privacy of both, the user and the host of a chatbot. You can also combine multiple _agents_ (chatbots) in a single application to separate the functionality of a bot into multiple logically separated units which are combined to one coherent bot.

The mid-term goal is to further reduce the required programming knowledge to setup a bot, and improving the protection of the users' privacy by incorporating additional means of protection, like the pseudonymization of users, per default.
These means can also be included at the current state, but are not enabled by default.

For a minimal setup, without these protecting means, please consult [this repository](https://github.com/emundo/emubot-minimal-example/).
The minimal setup should only be used to get to test the basic functionality of the framework.
We highly recommend to adapt our [more extensive example](https://github.com/emundo/emubot-extended-example/), which comes with a slightly more complex setup but enables you to e.g. use a database and pseudonymize users identifiers.

Offering this framework hopefully enables many individuals and (also small) companies, reducing the time and budget that has to be spent to develop a chatbot, while maintaining a high degree of control.

### Architecture

![Architecture overview](docs/_static/architecture.png)

### Setup
To start a chatbot you have to
1. Create an agent using an NLP service of your choice, get the required credentials and paste them into the configuration file (more information on these can be found at the distinctive section in our docs (see below).
2. Install the dependencies ([npm](https://www.npmjs.com/get-npm) required): open a terminal and type `npm install`.
3. Choose the configuration in your `src/main.ts`. Make sure to use the correct NLP service (the one you just set up).
4. Compile the code (`npm run tsc`) and run your bot (`npm run start`).

The simplest way to test whether your chatbot works would be to send the messages from your local machine to your chatbot. A CLI-Adapter which can be used to locally test if your bot is up and running, receives messages and sends an exemplar query, will be published soon.

#### Setup On Existing Messaging Services
If you want to deploy your bot to a messaging service such as Slack, you have to get the respective credentials (see [docs](https://emundo.github.io/emubot_doc/_build/html/index.html)) required to authenticate. Furthermore, you usually have to setup a server and communicate over https.
A detailed setup will follow soon.

### Documentation
Please consult the [docs](https://emundo.github.io/emubot_doc/_build/html/index.html) for further information regarding the setup, supported platforms, configuration files or details regarding the architecture.

#### Contribute To The Documentation
Our API reference is built using compodoc, while we use [sphinx](https://www.sphinx-doc.org/en/master/) for the description of the framework itself. You can follow the next steps if you would like to compile and change parts of the documentation (commands are valid for Ubuntu and might change across operating systems):

1. Install pip (e.g. `apt-get install python3-pip`).
2. Optional, but recommended: install virtualenv `pip install virtualenv`, create a virtual environment (`virtualenv sphinxenv`) and start the environment using `source sphinxenv/bin/activate`.
2. `pip install -r requirements.txt` (add the `--user` flag if you are not in a virtualenv).
3. Make sure to install npm and run `npm run createDocs`.

A primer for restructured text (which is the markup language used by Sphinx) can be found [here](http://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html).

### Logging
Logging is controlled in `./src/logger.ts` using [winston](https://www.npmjs.com/package/winston). Logs are written to stdout as well as two files: One file for errors only and one file with additional information, determined by your loglevel, which also determines the logs for stdout.
The default log level is set to "verbose" (more information can be found [here](https://www.npmjs.com/package/winston#logging-levels)). Please set the respective environment variable if you wish to change the loglevel (e.g.`export LOGLEVEL="error"`).

### Contributing

You would like to contribute? Awesome! Please check out our [Contribution Guidelines](https://emundo.github.io/emubot_doc/_build/html/contribute.html).


## License
This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details.

## Authors

* **Fiete Lüer**
* **Maxim Dolgich**
* **Bastian Gorholt**
* **Raphael Arias**
* **Tabea Spahn**
