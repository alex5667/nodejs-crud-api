import { IncomingMessage, ServerResponse } from "http";
import { User, UserId } from "../types/types.ts";
import { v4 as uuidv4, validate } from "uuid";

const users: Record<UserId, User> = {};

export const usersController = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const userId = req.url?.split("/").pop();
  if (req.method === "GET") {
    if (userId === "users") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
      return;
    }

    if (!validate(userId)) {
      res.writeHead(400);
      res.end("UserId is not invalid");
      return;
    }

    const user = users[userId];
    if (!user) {
      res.writeHead(404);
      res.end(`User with Id ${userId} doesn't exist`);
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
    return;
  }

  if (req.method === "POST") {
    try {
      const user = await parseRequestBody<User>(req);
      user.id = uuidv4();

      users[user.id] = user;
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } catch (error) {
      console.error("Error processing POST request:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
    return;
  }

  if (req.method === "PUT") {
    if (!userId || !validate(userId)) {
      res.writeHead(400);
      res.end("UserId is not invalid");
      return;
    }

    const user = users[userId];
    if (!user) {
      res.writeHead(404);
      res.end(`User with Id ${userId} doesn't exist`);
      return;
    }

    const userUpdated = await parseRequestBody<User>(req);
    users[userId] = userUpdated;

    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(userUpdated));
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Method Not Allowed" }));
};

async function parseRequestBody<T>(req: IncomingMessage): Promise<Awaited<T>> {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  return JSON.parse(Buffer.concat(buffers).toString());
}
