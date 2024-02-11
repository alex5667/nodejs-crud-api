import { User, UserId } from "../types/types.ts";
import { v4 as uuidv4 } from "uuid";
import { isUserDataValid } from "../utils/utils.ts";

const users: Record<UserId, User> = {
  // "637ca275-84e0-4e24-8025-ae9da7dbbb5a":{
  // "username": "5555",
  // "age": 21,
  // "hobbies": [
  //     "qwerty"
  // ],}
};

export const db = { users };

export type Database = typeof db;
export type GetDb = () => Database;

export async function getUsers(): Promise<User[]> {
  return Object.values(db.users);
}

export async function getUser(userId: UserId): Promise<User | undefined> {
  return db.users[userId];
}

export async function createUser(user: User): Promise<User> {
  user.id = uuidv4();

  if (isUserDataValid(user)) {
    db.users[user.id] = user;
    process.send?.({ task: "sync", data: db });

    return user;
  } else {
    return;
  }
}

export async function updateUser(
  userId: UserId,
  updatedUser: User
): Promise<User | undefined | string> {
  if (!users[userId]) {
    // throw new Error(`User with Id ${userId} doesn't exist`);
    return "doesn't exist";
  }
  if (isUserDataValid(updatedUser)) {
    db.users[userId] = updatedUser;
    process.send?.({ task: "sync", data: db });

    return updatedUser;
  } else {
    return;
  }
}

export async function deleteUser(userId: UserId): Promise<void> {
  if (!db.users[userId]) {
    throw new Error(`User with Id ${userId} doesn't exist`);
    // return
  }

  delete db.users[userId];
  process.send?.({ task: "sync", data: db });
}
