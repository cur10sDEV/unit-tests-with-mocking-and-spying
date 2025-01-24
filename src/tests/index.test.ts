import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { app } from "..";
import { prisma } from "../lib/__mocks__/db";

const server = request(app);

// deep mocking using this and __mocks__/file.ts
vi.mock("../lib/db.ts");

describe("users", () => {
  describe("get /users", () => {
    it("should return all users", async () => {
      // mocking the db return - resolved promise value
      prisma.user.findMany.mockResolvedValueOnce([]);

      const res = await server.get("/users");

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toBeTypeOf("object");
    });
  });

  describe("post /users", () => {
    it("should add new user", async () => {
      prisma.user.create.mockResolvedValue({ name: "John Doe", userId: 1 });

      const res = await server.post("/users").send({
        name: "John Doe",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeTypeOf("object");
      expect(res.body.user).keys(["userId", "name"]);
      expect(res.body.user.userId).toBe(1);
      expect(res.body.user.name).toBe("John Doe");
    });
  });

  describe("get /users/:userId", () => {
    it("should return user of a particular id", async () => {
      // mocking the db return - resolved promise value
      prisma.user.findUnique.mockResolvedValueOnce({
        name: "John Doe",
        userId: 1,
      });

      const res = await server.get("/users/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeTypeOf("object");
      expect(res.body.user).keys(["userId", "name"]);
      expect(res.body.user.userId).toBe(1);
      expect(res.body.user.name).toBe("John Doe");
    });

    it("should return 404 if no user exists", async () => {
      const res = await server.get("/users/56");

      expect(res.statusCode).toBe(404);
      expect(res.body).toMatchObject({ error: "user not found!" });
      expect(res.body.error).toBe("user not found!");
    });
  });
});

describe("calculate", () => {
  describe("sum", () => {
    it("should return sum of two numbers", async () => {
      // mocking the db return - resolved promise value
      prisma.calculation.create.mockResolvedValueOnce({
        id: 1,
        a: 1,
        b: 2,
        result: 3,
        type: "Sum",
      });

      // spying
      vi.spyOn(prisma.calculation, "create");

      const res = await server
        .post("/calculate")
        .send({ a: 1, b: 2, result: 3, type: "Sum" });

      expect(prisma.calculation.create).toHaveBeenCalledWith({
        data: {
          a: 1,
          b: 2,
          result: 3,
          type: "Sum",
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.result).toBe(3);
      // clear mock
      prisma.calculation.create.mockClear();
    });
  });
  describe("multiplication", () => {
    it("should return multiplication of two numbers", async () => {
      // mocking the db return - resolved promise value
      prisma.calculation.create.mockResolvedValueOnce({
        id: 1,
        a: 2,
        b: 3,
        result: 6,
        type: "Multiply",
      });

      // spying
      vi.spyOn(prisma.calculation, "create");

      const res = await server
        .post("/calculate")
        .send({ a: 2, b: 3, result: 6, type: "Multiply" });

      expect(prisma.calculation.create).toHaveBeenCalledExactlyOnceWith({
        data: {
          a: 2,
          b: 3,
          result: 6,
          type: "Multiply",
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.result).toBe(6);
      // clear mock
      prisma.calculation.create.mockClear();
    });
  });
});
