import { User, UserId } from "../types/types.ts";
import { v4 as uuidv4 } from "uuid";
import { isUserDataValid } from "../utils/utils.ts";

const users: Record<UserId, User> = {};

export async function getUsers(): Promise<User[]> {
  return Object.values(users);
}

export async function getUser(userId: UserId): Promise<User | undefined> {
  return users[userId];
}

export async function createUser(user: User): Promise<User> {
  user.id = uuidv4();

  if (isUserDataValid(user)) {
    users[user.id] = user;
    return user;
  } else {
    return;
  }
}

export async function updateUser(
  userId: UserId,
  updatedUser: User
): Promise<User | undefined| string> {
  if (!users[userId]) {
    // throw new Error(`User with Id ${userId} doesn't exist`);
    return "doesn't exist";
  }
  if (isUserDataValid(updatedUser)) {
    users[userId] = updatedUser;
    return updatedUser;
  } else {
    return;
  }
}

export async function deleteUser(userId: UserId): Promise<void> {
  if (!users[userId]) {
    throw new Error(`User with Id ${userId} doesn't exist`);
    // return
  }

  delete users[userId];
}
