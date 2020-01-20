/**
 * Generic response type that will be returned from our interceptors.
 * A `Response` either returns a payload and additional information that can be used in the next processing steps
 * or it returns a `NoResponse`.
 */

export type Response<T> =
    | {
          payload: T;
          kind: 'Response';
          statusCode: number;
          userId: string;
          interruptProcessing?: boolean;
          action?: string;
      }
    | NoResponse;

/**
 * If `NoResponse` is returned from an interceptor the user does not receive a visible message.
 */
export type NoResponse = {
    kind: 'NoResponse';
    statusCode: number;
    userId: string;
};
