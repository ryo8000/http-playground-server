import { HTTP_STATUS_CODE_MAP } from '../constants';

type StatusResponse = {
  /** The HTTP status code */
  code: number;
  /** A descriptive message about the status */
  message: string;
  /** Optional error information */
  error?: {
    /** A detailed error message */
    message: string
  }
}

/**
 * Creates a status response object.
 * @param {number} code - The HTTP status code to return.
 * @param {string} [errorMessage] - An optional error message.
 * @returns {StatusResponse} The constructed status response object.
 */
export const createStatusResponse = (
  code: number,
  errorMessage?: string
): StatusResponse => ({
  code,
  message: HTTP_STATUS_CODE_MAP[code] || 'unknown',
  ...(errorMessage && { error: { message: errorMessage } }),
});
