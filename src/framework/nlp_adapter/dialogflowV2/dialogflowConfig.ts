import { Agent, NlpConfig } from '../../configuration/configTypes';
import { DialogflowAdapter } from '../dialogflow/DialogflowAdapter';

export type DialogflowAgent = Agent & {
    project_id: string;
    defaultLifespan: number;
};

export type DialogflowAgents = {
    [key: string]: DialogflowAgent;
};

export interface DialogflowConfig extends NlpConfig<DialogflowAdapter> {
    agents: DialogflowAgents;
}
