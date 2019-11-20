import { SlackResponse } from '../model/SlackResponse';
import { ChatAdapterResponse } from '../../ChatAdapterResponse';

export function convertToSlackResponse(
    response: ChatAdapterResponse,
    user: string,
    channel: string,
): SlackResponse {
    switch (response.Message.type) {
        case 'text':
            return {
                text: response.Message.text,
                user,
                channel,
                type: 'text',
            };

        default:
            throw Error(
                `Not implemented as of yet: Message of type ${response.Message.type}`,
            );
    }
}
