export type StatusResponse = {
  code: number;
  message: string;
}

export const createStatusResponse = (code: number, message: string): StatusResponse => ({
  code,
  message,
});
