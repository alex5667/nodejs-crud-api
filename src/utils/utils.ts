import { IncomingMessage, ServerResponse } from "http";

import { version } from "uuid";
import { validate } from "uuid";
export const sendError = async (
  res: ServerResponse,
  statusCode: number,
  message: string
) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(message);
};

export const parseRequestBody = async <T>(
  req: IncomingMessage
): Promise<Awaited<T>> => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  return JSON.parse(Buffer.concat(buffers).toString());
};

export function sendJsonResponse(
  res: ServerResponse,
  data: any,
  statusCode: number = 200
) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export function validateUuidV4(uuid: string) {
  return validate(uuid) && version(uuid) === 4;
}

export function validateUserIdAndSendError(
  res: ServerResponse,
  statusCode: number = 200,
  userId: string
) {
  if (!validateUuidV4(userId)) {
    res.writeHead(statusCode);
    res.end("User Id is not valid");
    return;
  }
}
