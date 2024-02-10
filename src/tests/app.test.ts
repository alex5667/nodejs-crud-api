import { assert, describe, expect, it } from "vitest";
import request from "supertest";
import http from "http";
import { END_POINTS } from "../constants/constants.ts";
import { User } from "../types/types.ts";

const req = request("http://localhost:4000");

describe("App", () => {
  it("Requests to non-existing END_POINTS should be handled with 404", async () => {
    await req.get("/api/non-existing-endpoint").expect(404);
  });
});

describe("END_POINTS users", () => {
  // it(`Get all records with a GET api/users`, async () => {
  //   const response = await req.get(`${END_POINTS.users}`).expect(200);
  //   expect(response.body).toStrictEqual([]);
  // });

  it(`Create, read, update, delete is implemented properly`, async () => {
    const newUser: User = {
      username: "Test user",
      age: 58,
      hobbies: ["looking"],
    };
    const responseAddNew = await req
      .post(`${END_POINTS.users}`)
      .send(newUser)
      .expect(201);
    expect(responseAddNew.body.id).toBeTruthy();
    newUser.id = responseAddNew.body.id;
    expect(responseAddNew.body).toStrictEqual(newUser);

    const responseGet = await req
      .get(`${END_POINTS.users}/${newUser.id}`)
      .expect(200);
    expect(responseGet.body).toStrictEqual(newUser);

    const updatedUser = {
      id: newUser.id,
      username: "Modified ",
      age: 102,
      hobbies: ["hiking"],
    };
    const responsePut = await req
      .put(`${END_POINTS.users}/${updatedUser.id}`)
      .send(updatedUser)
      .expect(200);
    expect(responsePut.body).toStrictEqual(updatedUser);

    await req.delete(`${END_POINTS.users}/${newUser.id}`).expect(204);

    await req.get(`${END_POINTS.users}/${newUser.id}`).expect(404);
  });

  it(`A new object is created by a POST api/users request`, async () => {
    const response = await req
      .post(`${END_POINTS.users}`)
      .send({
        username: "Test",
        age: 58,
        hobbies: ["looking"],
      } as User)
      .expect(201);
    expect(response.body.id).toBeTruthy();
  });

  it(`GET, PUT :userId respose with 400 when userId is not uuid`, async () => {
    let response = await req
      .get(`${END_POINTS.users}/not-valid-uuid`)
      .expect(400);
    expect(response.text).toBe("User Id is not valid");

    response = await req.put(`${END_POINTS.users}/not-valid-uuid`).expect(400);
    expect(response.text).toBe("User Id is not valid");

    response = await req
      .delete(`${END_POINTS.users}/not-valid-uuid`)
      .expect(400);
    expect(response.text).toBe("User Id is not valid");
  });
});
