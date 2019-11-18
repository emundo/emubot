import { NlpContext } from './model/NlpAdapterResponse';
import { getConfig } from '../core/getConfig';

export function convertStringArrayToNlpContexts(
    contextNames: string[] | undefined,
    agentName: string,
): NlpContext[] | undefined {
    if (contextNames === undefined) {
        return undefined;
    }
    contextNames.map((contextName: string) => {
        return {
            name: contextName,
            lifespan:
                getConfig().platform.nlp.agents[agentName].defaultLifespan || 0,
        };
    });
}
