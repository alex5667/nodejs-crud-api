import { IncomingMessage, ServerResponse } from "http";
import { User } from "../types/types";
import { version } from "uuid";
import { validate } from "uuid";
export const sendError = async (
  res: ServerResponse,
  statusCode: number,
  message: string
) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(message));
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
  res.writeHead(statusCode);
  res.end("User Id is not valid");
  return;
}

export function isUserDataValid(user: unknown): user is User {
  if (!user || typeof user !== "object") return false;

  const age = (user as User).age;
  if (!age || typeof age !== "number") return false;

  const username = (user as User).username;
  if (!username || typeof username !== "string") return false;

  const hobbies = (user as User).hobbies;
  if (
    !Array.isArray(hobbies) ||
    hobbies.some((item) => typeof item !== "string")
  )
    return false;

  return true;
}
