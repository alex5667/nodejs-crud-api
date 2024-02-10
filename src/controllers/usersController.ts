import { IncomingMessage, ServerResponse } from "http";
import { User } from "../types/types.ts";
import { sendError, parseRequestBody } from "../utils/utils.ts";
import * as userService from "../services/userService.ts";
import { validateUuidV4 } from "../models/userModels.ts";
import { sendJsonResponse } from "../utils/utils.ts";
import { validateUserIdAndSendError } from "../utils/utils.ts";

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
        try {
          validateUserIdAndSendError(res, 400, userId);
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
      break;
    case "POST":
      try {
        const user = await parseRequestBody<User>(req);
        const createdUser = await userService.createUser(user);
        sendJsonResponse(res, createdUser, 201);
      } catch (error) {
        console.error("Error processing POST request:", error);
        sendError(res, 500, "Internal Server Error");
      }
      break;
    case "PUT":
      validateUserIdAndSendError(res, 400, userId);
      try {
        const updatedUser = await parseRequestBody<User>(req);
        const updatedUserResult = await userService.updateUser(
          userId,
          updatedUser
        );
        if (updatedUserResult) {
          sendJsonResponse(res, updatedUserResult, 200);
        } else {
          sendError(res, 404, `User with Id ${userId} doesn't exist`);
        }
      } catch (error) {
        console.error("Error processing PUT request:", error);
        sendError(res, 500, "Internal Server Error");
      }
      break;
    case "DELETE":
      try {
        if(!userId){
          sendError(res, 404, `User with Id ${userId} doesn't exist`);
        }
        validateUserIdAndSendError(res, 400, userId);

        const user = await userService.getUser(userId);
        if (!user) {
          res.writeHead(404);
          res.end(`User with Id ${userId} doesn't exist`);
          return;
        }

        await userService.deleteUser(userId);
        res.writeHead(204);
        res.end();
        return;
      } catch (error) {
        console.error("Error processing DELETE request:", error);
        sendError(res, 500, "Internal Server Error");
      }
      break;
    default:
      sendError(res, 405, "Method Not Allowed");
      break;
  }
};
