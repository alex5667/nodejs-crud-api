import { version } from "uuid";
import { validate } from "uuid";

export function validateUuidV4(uuid: string) {
  return validate(uuid) && version(uuid) === 4;
}
