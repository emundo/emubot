import * as chalk from 'chalk';
import { post, OptionsWithUrl } from 'request-promise-native';
import { ArgumentParser } from 'argparse';
import { Logger, createLogger, transports, format } from 'winston';
import {
    CliClientMessage,
    CliClientInitialMessage,
} from '../framework/chat_adapter/cli/model/CliClientRequest';
import { CliClientResponse } from '../framework/chat_adapter/cli/model/CliClientResponse';

const colorizeSuccess = chalk.bold.green;
const stdin = process.stdin;
const stdout = console.log;

let logger: Logger;
let url: string;

function createRequestConfiguration(textRequest: string): OptionsWithUrl {
    const body: CliClientMessage = {
        type: 'message',
        text: textRequest,
        id: 'CLI',
    };

    return {
        body,
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        url,
    };
}

function prompt(): void {
    process.stdout.write(colorizeSuccess('Your text: '));
}

async function sendHello(): Promise<void> {
    const body: CliClientInitialMessage = {
        type: 'initial',
        id: 'CLI',
    };

    const config: OptionsWithUrl = {
        body,
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        url,
    };
    post(config);
}

async function sendMessage(text: string): Promise<void> {
    const config: OptionsWithUrl = createRequestConfiguration(text);
    try {
        const response: CliClientResponse[] = await post(config);
        logger.verbose(JSON.stringify(response, null, 2));
        response.forEach((resp: CliClientResponse) => {
            stdout(`${colorizeSuccess('emubot:')} ${resp.text}`);
        });
    } catch (e) {
        logger.error(e.message);
    }
}

async function main(): Promise<void> {
    const description = colorizeSuccess(
        `CLI test client for the emubot framework.`,
    );
    const parser = new ArgumentParser({
        description,
        addHelp: true,
    });

    const defaultUrl = 'http://localhost:4000/webhook';

    parser.addArgument(['--verbose'], {
        help: 'Print the emubot JSON response.',
        action: 'storeTrue',
    });
    parser.addArgument(['-u', '--url'], {
        help:
            'URL to the server (domain) you are hosting the emubot framework on.',
        defaultValue: defaultUrl,
    });
    const args = parser.parseArgs(process.argv.slice(2));

    const LOG_LEVEL = args.verbose ? 'verbose' : 'info';

    logger = createLogger({
        transports: [
            new transports.Console({
                level: LOG_LEVEL,
                format: format.combine(format.colorize(), format.simple()),
            }),
        ],
    });

    url = args.url;

    if (args.url !== defaultUrl) {
        url = args.url;
    }

    prompt();

    await sendHello();

    stdin.on('data', async (data: Buffer) => {
        await sendMessage(data.slice().toString());
        prompt();
    });
}

main();
