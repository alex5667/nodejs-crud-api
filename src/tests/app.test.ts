import { describe, it } from "vitest";
import request from "supertest";

const req = request("http://localhost:4000");

describe("App", () => {
  it("Requests to non-existing END_POINTS should be handled with 404", async () => {
    await req.get("/api/non-existing-endpoint").expect(404);
  });
});
