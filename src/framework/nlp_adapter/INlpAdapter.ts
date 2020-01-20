import { NlpResponse, NlpStatus } from './model/NlpAdapterResponse';
import { TextRequest } from './model/TextRequest';

/**
 * Implementing this interface is required by all classes that implement the functionality of NLP
 * services (also called NLP adapters).
 *
 * Not all NLP services implement the same concepts with the same naming, we will try to keep our
 * definitions as clear as possible. For more information regarding the concepts in terms of the
 * respective NLP service, please consult our external documentation.
 */
export interface NlpAdapter {
    /**
     * Lifespan of a context (see [Lifespan]{@link ../../_build/html/nlp_adapter/custom_nlp_adapter.html}).
     */
    lifespanInMinutes: number;

    /**
     * Deletes **ALL** contexts of a session specified by `internalUserId`.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    deleteAllContexts(
        internalUserId: string,
        agentName: string,
    ): Promise<NlpStatus>;

    /**
     * Deletes selected contexts, specified by their name.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     * @param contextsToDelete An array of context names that shall be deleted.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    deleteSelectedContexts(
        internalUserId: string,
        agentName: string,
        contextsToDelete: string[],
    ): Promise<NlpStatus>;

    /**
     * Posts an array of contexts to an NLP service.
     *
     * @param internalUserId User identifier. Should be pseudonymized at this point.
     * @param contextsToPost Array of names of contexts that should be set.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpStatus that includes `success:true`, if all contexts have been deleted,
     *          `success:false` and information regarding the error, if not all contexts were deleted.
     */
    postContexts(
        internalUserId: string,
        agentName: string,
        contextsToPost: string[],
    ): Promise<NlpStatus>;

    /**
     * Send a single text request to an NLP service.
     *
     * @param textRequest Includes the user identifier (should be pseudonymized at this point) and
     *                    the message that should be classified by the NLP service.
     * @param agentName Name of the agent ("bot") your request should be sent to.
     *                  Can be chosen arbitrarily in your configuration file.
     *
     * @returns An NlpResponse which is preprocessed to be further processed by the core.
     */
    sendSingleTextRequest(
        textRequest: TextRequest,
        agentName: string,
    ): Promise<NlpResponse>;
}

/**
 * Signals that an action, such as posting a context, has been successful.
 */
export function makeSuccess(): NlpStatus {
    return {
        success: true,
    } as NlpStatus;
}
