import { NoResponse, Response } from '../model/Response';

/**
 * Used if no visible response should be sent to the user (e.g. if you only want to send a response with a
 * status code to the messaging platform). Use with care: Not sending a message usually confuses the user.
 * You might want to send `NoResponse` if you send another Response from your interceptor, especially a message
 * format not supported by the emubot framework.
 *
 * @param statusCode HTML status code sent back to the messenging platform.
 * @param userId User identifier. Has to already be depseudonymized!
 */
export function createNoResponse(
    statusCode: number,
    userId: string,
): NoResponse {
    return {
        kind: 'NoResponse',
        statusCode,
        userId,
    };
}
/**
 * Create a generic response of type T. Implies that the user should receive a visible response.
 *
 * @param payload Generic payload.
 * @param statusCode HTML status code sent back to the messaging platform.
 */
export function createResponse<T>(
    payload: T,
    statusCode: number,
    userId: string,
): Response<T> {
    return {
        kind: 'Response',
        payload,
        statusCode,
        userId,
    };
}
