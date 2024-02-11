import { describe, expect, it } from "vitest";
import supertest from "supertest";
import { END_POINTS } from "../constants/constants.ts";
import { User } from "../types/types.ts";

// const isCluster = Boolean(process.env.TEST_CLUSTER);
const request = supertest(`http://localhost:${process.env.PORT}`);

describe("cluster app", () => {
  it("should sync added, updated, deleted users across all worker processes", async () => {
    const response = await request.get(END_POINTS.users).expect(200);
    expect(response.body).toStrictEqual([]);

    // create
    const newUser: User = {
      username: "Test user",
      age: 42,
      hobbies: ["cooking", "painting", "hiking"],
    };
    const responseAddNew = await request
      .post(`${END_POINTS.users}`)
      .send(newUser)
      .expect(201);
    expect(responseAddNew.body.id).toBeTruthy();
    newUser.id = responseAddNew.body.id;
    expect(responseAddNew.body).toStrictEqual(newUser);

    const pidAdd = Number(responseAddNew.headers["process-id"]);
    expect(pidAdd).toBeTruthy();

    const responseList = await requestUntilFindAnotherProcess(
      request.get(END_POINTS.users).expect(200),
      pidAdd
    );
    expect(responseList.body).toStrictEqual([newUser]);

    // update
    const updatedUser = {
      ...newUser,
      username: "Modified username",
    };
    const responsePut = await request
      .put(`${END_POINTS.users}/${updatedUser.id}`)
      .send(updatedUser)
      .expect(200);
    expect(responsePut.body).toStrictEqual(updatedUser);

    const pidUpdate = Number(responseAddNew.headers["process-id"]);
    expect(pidUpdate).toBeTruthy();

    const responseListAfterUpdate = await requestUntilFindAnotherProcess(
      request.get(END_POINTS.users).expect(200),
      pidUpdate
    );
    expect(responseListAfterUpdate.body).toStrictEqual([updatedUser]);

    // delete
    const responseDelete = await request
      .delete(`${END_POINTS.users}/${newUser.id}`)
      .expect(204);
    const pidDelete = Number(responseDelete.headers["process-id"]);
    expect(pidDelete).toBeTruthy();

    const responseListAfterDelete = await requestUntilFindAnotherProcess(
      request.get(END_POINTS.users).expect(200),
      pidDelete
    );
    expect(responseListAfterDelete.body).toStrictEqual([]);
  });
});

async function requestUntilFindAnotherProcess(
  request: supertest.Test,
  pid: number
): Promise<supertest.Response> {
  let pidRequested = pid;
  let response: supertest.Response | undefined;
  while (pid === pidRequested) {
    response = await request;
    pidRequested = Number(response.headers["process-id"]);
  }

  if (!response) throw new Error("response is not collected");

  return response;
}
