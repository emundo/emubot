import { randomBytes } from 'crypto';

/**
 * Function to generate random user IDs.
 *
 * @returns a 20 byte random hex string which can be used as a user identifier.
 */
export function generateId(): string {
    return randomBytes(20).toString('hex');
}
