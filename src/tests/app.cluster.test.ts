import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request, { SuperTest } from "supertest";
import { END_POINTS } from "../constants/constants.ts";
import { User } from "../types/types.ts";
import supertest from "supertest";
import "dotenv/config";
import { cpus } from "os";

const isCluster = Boolean(process.env.TEST_CLUSTER);
const req = request(`http://localhost:${Number(process.env.PORT)}`);

describe.runIf(isCluster)("cluster app", () => {
  beforeEach(async () => {
    const response = await req.get(END_POINTS.users).expect(200);
    const users = response.body as User[];

    for (const user of users) {
      await req.delete(`${END_POINTS.users}/${user.id}`).expect(404);
    }
  });

  afterEach(async () => {
    const response = await req.get(END_POINTS.users).expect(200);
    const users = response.body as User[];

    for (const user of users) {
      await req.delete(`${END_POINTS.users}/${user.id}`).expect(204);
    }
  });

  it("should sync added, updated, deleted users across all worker processes", async () => {
    const newUser: User = {
      username: "User",
      age: 42,
      hobbies: ["photography", "playing guitar", "gardening"],
    };
  
    const responseAddNew = await req
      .post(`${END_POINTS.users}`)
      .send(newUser)
      .expect(201);
    expect(responseAddNew.body.id).toBeTruthy();
    newUser.id = responseAddNew.body.id;
    expect(responseAddNew.body).toStrictEqual(newUser);
  
    const pidAdd = Number(responseAddNew.headers["process-id"]);
    expect(pidAdd).toBeTruthy();
  
    const responseList = await reqUntilFindAnotherProcess(
      req.get(END_POINTS.users).expect(200),
      pidAdd
    );
    expect(responseList.body).toStrictEqual([newUser]);
  
    const updatedUser = {
      ...newUser,
      username: "Modified username",
      age: 22, 
      hobbies: ["hiking"], 
    };
    const responsePut = await req
      .put(`${END_POINTS.users}/${updatedUser.id}`)
      .send(updatedUser)
      .expect(200);
    expect(responsePut.body).toStrictEqual(updatedUser);
  
    const pidUpdate = Number(responsePut.headers["process-id"]);
    expect(pidUpdate).toBeTruthy();
  
    const responseListAfterUpdate = await reqUntilFindAnotherProcess(
      req.get(END_POINTS.users).expect(200),
      pidUpdate
    );
    expect(responseListAfterUpdate.body).toContainEqual(updatedUser);
  
    const responseDelete = await req
      .delete(`${END_POINTS.users}/${newUser.id}`)
      .expect(204);
    const pidDelete = Number(responseDelete.headers["process-id"]);
    expect(pidDelete).toBeTruthy();
  
    const responseListAfterDelete = await reqUntilFindAnotherProcess(
      req.get(END_POINTS.users).expect(200),
      pidDelete
    );
    expect(responseListAfterDelete.body).toStrictEqual([]);
  
    const responseGetAfterDelete = await req
      .get(`${END_POINTS.users}/${newUser.id}`)
      .expect(404);
  });
});

async function reqUntilFindAnotherProcess(
  req: supertest.Test,
  pid: number
): Promise<supertest.Response> {
  let pidReq = pid;
  let response: supertest.Response | undefined;
  while (pid === pidReq) {
    const nextPort = getNextPort();

    const reqForNextProcess = request(`http://localhost:${nextPort}`);

    response = await reqForNextProcess.get(END_POINTS.users).expect(200);

    pidReq = Number(response.headers["process-id"]);
  }

  if (!response) throw new Error("response is not collected");

  return response;
}

function getNextPort(): number {
  const currentPort = Number(process.env.PORT);

  const numCPUs = cpus().length;

  const nextPort = currentPort + numCPUs - 1;

  return nextPort;
}
