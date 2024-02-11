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
