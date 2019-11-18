import { SlackRequest } from '../model/SlackRequest';
import { ChatAdapterRequest } from '../../ChatAdapterRequest';

export function convertIntoChatAdapterRequest(
    request: SlackRequest,
): ChatAdapterRequest {
    return {
        type: 'text',
        message: request.text,
        isFromAdmin: false,
    };
}
