import { NlpResponse } from '../../nlp_adapter/model/NlpAdapterResponse';
import { ChatAdapterTextRequest } from '../../chat_adapter/ChatAdapterRequest';
import { logger } from '../../logger';
import { getOrderedAgents } from './getOrderedAgents';
import { LOG_MESSAGES } from '../../constants/logMessages';
import { adapter } from '../getAdapter';
import { nlpToNlp } from '../getInterceptors';
import { TextRequest } from '../../nlp_adapter/model/TextRequest';

const PRIMARY_AGENT_INDEX = 0;

type NlpResponseData = {
    agentName: string;
    response: NlpResponse;
};
const agents = getOrderedAgents();

/**
 * Checks if the message passes the agent specific minimal threshold, i.e. the confidence of the NLP service exceeds
 * some predefined and individually set threshold.
 *
 * @param botResponse Response returned from an NLP service.
 * @param agentIndex Identifier of the agent used to retrieve `botResponse`.
 */
const doesResponsePassScoringThreshold = (
    botResponse: NlpResponse,
    agentIndex: number,
): boolean => {
    const minimalAcceptableScore = agents[agentIndex].minScore;
    const textRequestResult = botResponse.textRequestResult;
    const score = textRequestResult.score;

    return score >= minimalAcceptableScore;
};

/**
 * Tries to find the best matching answer for an incoming request by the user. The message is sent to every
 * agent sorted by descending agent importance until a response with a high-enough score is returned. The
 * primary agent's answer servers as a fallback solution if no answer passes our scoring threshold.
 *
 * @param message Incoming TextRequest that should be processed.
 * @param primaryAgentResponse Answer from the first NLP agent. Will be used if no agent returns an answer
 *                             with a sufficient score.
 * @param index Index of the agent to whom the message will be sent.
 */
export async function findBestNlpAnswerForTextRequest(
    message: ChatAdapterTextRequest,
    internalUserId: string,
    primaryAgentResponse: NlpResponse | undefined = undefined,
    index = 0,
): Promise<NlpResponseData> {
    const agent = agents[index];
    logger.debug(`${LOG_MESSAGES.response.agent}${agent.name}`);
    const currentResponse: NlpResponse = await adapter.nlp.sendSingleTextRequest(
        { message: message.message, internalUserId } as TextRequest,
        agent.name,
    );
    logger.debug(
        `${LOG_MESSAGES.response.score}${currentResponse.textRequestResult.score}`,
    );

    const isResponseScoreGoodEnough: boolean = doesResponsePassScoringThreshold(
        currentResponse,
        index,
    );

    /**
     * Interceptor 2 - nlpToNlp
     *
     * Expects the message and the flag whether the score is good enough to use the response of this agents as an
     * answer to the user. This can be helpful if you e.g. want to use the answer despite it being a fallback intent
     * (you might want to process specific fallback intents). Can also be used to reset the context of specific agents
     * (e.g. if the score did not pass the threshold).
     */
    return (await nlpToNlp)
        .handleMessage(internalUserId, currentResponse)
        .then(responseFromInterceptor => {
            if (responseFromInterceptor.kind === 'NoResponse') {
                throw new Error(LOG_MESSAGES.core.noResponseNotPossible);
            } else {
                const response = responseFromInterceptor.payload;
                if (response.textRequestResult.isFallbackIntent) {
                    logger.verbose(
                        `${LOG_MESSAGES.core.isFallbackIntent} ${LOG_MESSAGES.core.sendToNextAgent}`,
                    );
                    if (index < agents.length - 1) {
                        return findBestNlpAnswerForTextRequest(
                            message,
                            internalUserId,
                            index === 0 ? response : primaryAgentResponse,
                            index + 1,
                        );
                    }
                }
                if (
                    isResponseScoreGoodEnough &&
                    !response.textRequestResult.isFallbackIntent
                ) {
                    return {
                        agentName: agent.name,
                        response,
                    };
                }

                if (index === agents.length - 1) {
                    // No satisfying answer and no more agents left to ask, send the answer of the primary agent by default.
                    return {
                        agentName: agents[PRIMARY_AGENT_INDEX].name,
                        response: primaryAgentResponse || response,
                    };
                }

                // We have not found a satisfying answer, yet. But there are more agents left!
                logger.verbose(
                    `${LOG_MESSAGES.core.scoreBelowThreshold} ${LOG_MESSAGES.core.sendToNextAgent}`,
                );

                return findBestNlpAnswerForTextRequest(
                    message,
                    internalUserId,
                    index === 0 ? response : primaryAgentResponse,
                    index + 1,
                );
            }
        });
}
