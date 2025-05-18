import { HTTP_STATUS_CODE_MAP } from '../utils/http';

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
 * Creates a status response object with the specified HTTP status code and optional details.
 *
 * @param code - The HTTP status code to return
 * @param options - Optional parameters for customizing the response
 * @param options.message - Custom status message (defaults to standard HTTP status message)
 * @param options.errorMessage - Optional error message to include in the response
 * @returns A status response object containing the code, message, and optional error details
 */
export const createStatusResponse = (
  code: number,
  {
    message,
    errorMessage,
  }: {
    /** Custom status message (defaults to standard HTTP status message) */
    message?: string;
    /** Optional error message to include in the response */
    errorMessage?: string | undefined;
  } = {}
): StatusResponse => ({
  code,
  message: message ?? (HTTP_STATUS_CODE_MAP[code] || 'unknown'),
  ...(errorMessage && { error: { message: errorMessage } }),
});
