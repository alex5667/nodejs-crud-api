import { describe, expect, it } from "vitest";
import request from "supertest";
import { END_POINTS } from "../constants/constants.ts";
import { User } from "../types/types.ts";

const req = request("http://localhost:4000");

describe(`User Management Tests`, () => {
  describe(`Scenario 1: CRUD Operations`, () => {
    it(`should perform CRUD operations on users`, async () => {
      const initialResponse = await req.get(END_POINTS.users).expect(200);
      expect(initialResponse.body).toStrictEqual([]);

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

      // READ
      const responseGet = await req
        .get(`${END_POINTS.users}/${newUser.id}`)
        .expect(200);
      expect(responseGet.body).toStrictEqual(newUser);

      // UPDATE
      const updatedUser = {
        id: newUser.id,
        username: "Modified username",
        age: 22,
        hobbies: ["hiking"],
      };
      const responsePut = await req
        .put(`${END_POINTS.users}/${updatedUser.id}`)
        .send(updatedUser)
        .expect(200);
      expect(responsePut.body).toStrictEqual(updatedUser);

      // DELETE
      await req.delete(`${END_POINTS.users}/${newUser.id}`).expect(204);

      // READ
      await req.get(`${END_POINTS.users}/${newUser.id}`).expect(404);
    });
  });

  it(`GET, PUT api/users/:userId respond with 400 when userId is not uuid`, async () => {
    let response = await req
      .get(`${END_POINTS.users}/not-valid-uuid`)
      .expect(400);
    expect(response.text).toBe("\"User Id is not valid\"");

    response = await req.put(`${END_POINTS.users}/not-valid-uuid`).expect(400);
    expect(response.text).toBe("\"User Id is not valid\"");

    response = await req
      .delete(`${END_POINTS.users}/not-valid-uuid`)
      .expect(400);
    expect(response.text).toBe("\"User Id is not valid\"");
  });

  it(`should not create user, if all required fields not filled or have mismatched type`, async () => {
    let partialUser: Partial<User> = {
      username: "User",
      age: 42,
    };
    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);

    partialUser = {
      username: "User",
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);

    partialUser = {
      username: "User",
      age: 42,
    };

    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);

    partialUser = {
      username: "User",
      age: 42,
      hobbies: [null, "painting", "hiking"] as string[],
    };
    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);

    partialUser = {
      username: null as unknown as string,
      age: 42,
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);

    partialUser = {
      username: "User",
      age: null as unknown as number,
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req.post(`${END_POINTS.users}`).send(partialUser).expect(400);
  });

  it(`should not edit user, if all required fields not filled or have mismatched type`, async () => {
    // Create a new object by a POST api/users req
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

    let partialUser: Partial<User> = {
      username: "User",
      age: 42,
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);

    partialUser = {
      username: "User",
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);

    partialUser = {
      username: "User",
      age: 42,
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);

    partialUser = {
      username: "User",
      age: 42,
      hobbies: [null, "painting", "hiking"] as string[],
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);

    partialUser = {
      username: null as unknown as string,
      age: 42,
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);

    partialUser = {
      username: "User",
      age: null as unknown as number,
      hobbies: ["photography", "playing guitar", "gardening"],
    };
    await req
      .put(`${END_POINTS.users}/${newUser.id}`)
      .send(partialUser)
      .expect(400);
  });
});



 
  
  