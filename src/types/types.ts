import { v4 as uuidv4 } from "uuid";

export interface User {
  id?: UserId;
  username: string;
  age: number;
  hobbies: string[];
}

export type UserId = string;
