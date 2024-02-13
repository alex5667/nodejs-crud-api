import { IncomingMessage, ServerResponse } from "http";
import { User } from "../types/types.ts";
import { sendError, parseRequestBody, validateUuidV4 } from "../utils/utils.ts";
import * as userService from "../services/userService.ts";
import { sendJsonResponse } from "../utils/utils.ts";

export const usersController = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const userId = req.url?.split("/").pop();
  switch (req.method) {
    case "GET":
      if (userId === "users") {
        try {
          const users = await userService.getUsers();
          sendJsonResponse(res, users, 200);
        } catch (error) {
          console.error("Error processing GET request:", error);
          sendError(res, 500, "Internal Server Error");
        }
      } else {
        if (!validateUuidV4(userId)) {
          sendError(res, 400, "User Id is not valid");
        } else {
          try {
            const user = await userService.getUser(userId);
            if (user) {
              sendJsonResponse(res, user, 200);
            } else {
              sendError(res, 404, `User with Id ${userId} doesn't exist`);
            }
          } catch (error) {
            console.error("Error processing GET request:", error);
            sendError(res, 500, "Internal Server Error");
          }
        }
      }
      break;
    case "POST":
      try {
        const user = await parseRequestBody<User>(req);
        const createdUser = await userService.createUser(user);
        if (createdUser) {
          sendJsonResponse(res, createdUser, 201);
        } else {
          sendError(res, 400, "Input is not valid");
        }
      } catch (error) {
        console.error("Error processing POST request:", error);
        sendError(res, 500, "Internal Server Error");
      }

      break;
    case "PUT":
      if (!validateUuidV4(userId)) {
        sendError(res, 400, "User Id is not valid");
      } else {
        try {
          const updatedUser = await parseRequestBody<User>(req);
          const updatedUserResult = await userService.updateUser(
            userId,
            updatedUser
          );
          if (typeof updatedUserResult === "object") {
            sendJsonResponse(res, updatedUserResult, 200);
          } else if (updatedUserResult === "doesn't exist") {
            sendError(res, 404, `User with Id ${userId} doesn't exist`);
          } else {
            sendError(res, 400, "Input is not valid");
          }
        } catch (error) {
          console.error("Error processing PUT request:", error);
          sendError(res, 500, "Internal Server Error");
        }
      }

      break;
    case "DELETE":
      if (!userId || !validateUuidV4(userId)) {
        sendError(res, 400, "User Id is not valid");
        return;
      } else {
        try {
          const user = await userService.getUser(userId);
          if (!user) {
            res.writeHead(404);
            res.end(`User with Id ${userId} doesn't exist`);
            return;
          }

          await userService.deleteUser(userId);
          res.writeHead(204);
          res.end();
        } catch (error) {
          console.error("Error processing DELETE request:", error);
          sendError(res, 500, "Internal Server Error");
        }
      }

      break;
    default:
      sendError(res, 405, "Method Not Allowed");
      break;
  }
};
