import { User, UserId } from "../types/types.ts";
import { v4 as uuidv4, validate } from "uuid";

const users: Record<UserId, User> = {};

export async function getUsers(): Promise<User[]> {
  return Object.values(users);
}

export async function getUser(userId: UserId): Promise<User | undefined> {
  return users[userId];
}

export async function createUser(user: User): Promise<User> {
  user.id = uuidv4();
  users[user.id] = user;
  return user;
}

export async function updateUser(
  userId: UserId,
  updatedUser: User
): Promise<User | undefined> {
  if (!users[userId]) {
    throw new Error(`User with Id ${userId} doesn't exist`);
  }

  users[userId] = updatedUser;
  return updatedUser;
}

export async function deleteUser(userId: UserId): Promise<void> {
  
  if (!users[userId]) {
    throw new Error(`User with Id ${userId} doesn't exist`);
  }

  delete users[userId];
}
