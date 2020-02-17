import { NlpAdapter } from '../../src/framework/nlp_adapter/INlpAdapter';
import {
    NlpStatus,
    NlpResponse,
    NlpText,
} from '../../src/framework/nlp_adapter/model/NlpAdapterResponse';
import { getConfig, Agents, generateId, NlpConfig } from '../../src/framework';
import { TextRequest } from '../../src/framework/nlp_adapter/model/TextRequest';
import * as crypto from 'crypto';

export const nlpMessageMap = new Map<string, string[]>();

export class DummyNlpAdapter implements NlpAdapter {
    lifespanInMinutes: number;

    public currentContextMap = new Map<string, Map<string, string[]>>();

    constructor() {
        this.lifespanInMinutes = 5;
        const agents: Agents = getConfig().platform.nlp.agents;
        const agentNames: string[] = Object.keys(agents);

        agentNames.forEach(agentName =>
            this.currentContextMap.set(agentName, new Map<string, string[]>()),
        );
    }

    async deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus> {
        if (this.currentContextMap.has(agentName)) {
            const contextMap = this.currentContextMap.get(agentName);
            if (contextMap === undefined) {
                throw new Error('This can never happen.');
            }

            const success = contextMap.delete(internalUserId);

            return {
                success,
            } as NlpStatus;
        } else {
            return {
                success: false,
                errorDetails: 'Unknown agent was selected',
                errorType: 'UnknownAgentError',
            };
        }
    }

    async deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextsToDelete: string[],
    ): Promise<NlpStatus> {
        const contextMap = this.currentContextMap.get(agentName);

        if (contextMap) {
            const contextArray = contextMap.get(internalUserId) as string[];
            contextsToDelete.forEach((context: string) => {
                if (contextArray.includes(context)) {
                    contextArray.splice(contextArray.indexOf(context));
                }
            });
            contextMap.set(internalUserId, contextArray);

            return {
                success: true,
            } as NlpStatus;
        }

        return {
            success: false,
            errorDetails: 'Unknown agent was selected',
            errorType: 'UnknownAgentError',
        };
    }

    async postContexts(
        internalUserId: string,
        agentName: string,
        contextsToPost: string[],
    ): Promise<NlpStatus> {
        if (this.currentContextMap.has(agentName)) {
            const contextMap = this.currentContextMap.get(agentName) as Map<
                string,
                string[]
            >;
            contextMap.set(internalUserId, contextsToPost);

            return {
                success: true,
            };
        }

        return {
            success: false,
            errorDetails: 'Unknown agent was selected',
            errorType: 'UnknownAgentError',
        };
    }

    async sendSingleTextRequest(
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse> {
        if (!this.currentContextMap.has(agentName)) {
            return {
                status: {
                    success: false,
                    errorDetails: 'Unknown agent was selected',
                    errorType: 'UnknownAgentError',
                },
                agentName,
                textRequestResult: {
                    resolvedQuery: textRequest.message,
                    intentname: generateId(),
                    action: generateId(),
                    isFallbackIntent: false,
                    parameters: {},
                    message: [
                        {
                            type: 'text',
                            text: 'Hello!',
                        },
                    ],
                    score: 0.9,
                },
            };
        }

        if (textRequest.message === 'oneResponse') {
            const message: NlpText[] = [
                {
                    type: 'text',
                    text: 'Hello!',
                },
            ];
            nlpMessageMap.set(
                textRequest.internalUserId,
                message.map((randomMessage: NlpText) => randomMessage.text),
            );

            return {
                status: {
                    success: true,
                },
                agentName,
                textRequestResult: {
                    resolvedQuery: textRequest.message,
                    intentname: generateId(),
                    action: generateId(),
                    isFallbackIntent: false,
                    parameters: {},
                    message: message,
                    score: 0.9,
                },
            };
        }

        if (textRequest.message === 'multipleResponses') {
            const randomMessages: NlpText[] = [];

            for (let i = 0; i < 10; i++) {
                randomMessages[i] = {
                    type: 'text',
                    text: crypto.randomBytes(20).toString('hex'),
                };
            }

            nlpMessageMap.set(
                textRequest.internalUserId,
                randomMessages.map(
                    (randomMessage: NlpText) => randomMessage.text,
                ),
            );

            return {
                status: {
                    success: true,
                },
                agentName,
                textRequestResult: {
                    resolvedQuery: textRequest.message,
                    intentname: generateId(),
                    action: generateId(),
                    isFallbackIntent: false,
                    parameters: {},
                    message: randomMessages,
                    score: 0.9,
                },
            };
        }

        return {
            status: {
                success: true,
            },
            agentName,
            textRequestResult: {
                resolvedQuery: textRequest.message,
                intentname: generateId(),
                action: generateId(),
                isFallbackIntent: true,
                parameters: {},
                message: [
                    {
                        type: 'text',
                        text: 'Sorry I did not understand this!!',
                    },
                ],
                score: 0.1,
            },
        };
    }
}

export const platformDummyAdapter: NlpConfig<DummyNlpAdapter> = {
    agents: {
        first: {
            executionIndex: 0,
            minScore: 0.8,
            token: '',
            url: '',
            languageCode: '',
        },
        second: {
            executionIndex: 0,
            minScore: 0.8,
            token: '',
            url: '',
            languageCode: '',
        },
    },
    constructor: DummyNlpAdapter,
    name: 'dummyNlpAdapter',
};
