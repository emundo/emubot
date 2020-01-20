import { NlpAdapter } from '../INlpAdapter';
import { TextRequest } from '../model/TextRequest';
import {
    deleteAllContexts,
    deleteSelectedContexts,
} from '../communication/deleteContexts';
import { NlpStatus, NlpResponse } from '../model/NlpAdapterResponse';
import { sendTextRequest } from './communication/sendTextRequest';
import { postContexts } from '../communication/postContexts';

/**
 * Adapter for the [Snips NLU](https://snips-nlu.readthedocs.io/en/latest/) framework.
 *
 * Given a phrase such as
 * ```
 *      What will the weather be like in paris at 9pm?
 * ```
 * Snips NLU will parse the query and answer with a result of the form:
 * ```
 * {
 * "intent": {
 *    "intentName": "searchWeatherForecast",
 *    "probability": 0.95
 * },
 * "slots": [
 *    {
 *        "value": "paris",
 *        "entity": "locality",
 *        "slotName": "forecastLocality"
 *    },
 *    {
 *        "value": {
 *        "kind": "InstantTime",
 *        "value": "2018-02-08 20:00:00 +00:00"
 *        },
 *        "entity": "snips/datetime",
 *        "slotName": "forecastStartDatetime"
 *    }
 *  ]
 * }
 * ```
 * If you want emubot to handle the messages which should be supplied to the user, you should add a `messages`
 * field into the parsed result. You can also add a `contexts` field if desired. The request to the Snips webhook
 * will also include an internalUserID which can be used to differentiate between users.
 *
 * For more information regarding the purpose of each function, take a look at the implemented interface.
 *
 * @implements {NlpAdapter}
 */
export class SnipsAdapter implements NlpAdapter {
    // Lifespan not required. Snips does not support the same notion of contexts as other NLP services.
    public lifespanInMinutes = 0;

    public async deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus> {
        return deleteAllContexts(internalUserId, agentName);
    }

    public deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextToDelete: string[],
    ): Promise<NlpStatus> {
        return deleteSelectedContexts(
            internalUserId,
            agentName,
            contextToDelete,
        );
    }

    public async postContexts(
        internalUserId: string,
        agentName: string,
        contexts: string[],
    ): Promise<NlpStatus> {
        return postContexts(internalUserId, agentName, contexts);
    }

    public async sendSingleTextRequest(
        this: SnipsAdapter,
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse> {
        return sendTextRequest(textRequest, agentName);
    }
}
