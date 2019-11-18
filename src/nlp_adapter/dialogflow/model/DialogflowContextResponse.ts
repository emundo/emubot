import { DialogflowStatus } from './DialogflowStatus';

export type DialogflowContextResponse = {
    type: 'context';
    status: DialogflowStatus;
};
