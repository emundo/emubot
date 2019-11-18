import { Agent } from '../../configuration/configTypes';
import { getConfig } from '../getConfig';

type AgentWithName = Agent & { name: string };

/**
 * Get a sorted list of all configured agents.
 *
 * @returns an array of agents ordered descending with regards to their execution index.
 * Execution index: increasing index means decreasing importance. It is set in the config.
 */
export function getOrderedAgents(): AgentWithName[] {
    const agentsObj = getConfig().platform.nlp.agents;

    return Object.keys(agentsObj)
        .sort(
            (agentKey1, agentKey2) =>
                agentsObj[agentKey1].executionIndex -
                agentsObj[agentKey2].executionIndex,
        )
        .map(agentKey => ({ ...agentsObj[agentKey], name: agentKey }));
}
