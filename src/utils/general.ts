export const normalizeResponse = <T>(statusCode: number, data: T) =>
  statusCode >= 300
    ? {
        statusCode,
        error: data,
      }
    : {
        statusCode,
        data,
      };
