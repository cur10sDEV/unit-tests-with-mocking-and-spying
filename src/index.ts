import express from "express";
import { prisma } from "./lib/db";

export const app = express();

app.use(express.json());

interface IUser {
  id: number;
  name: string;
}
// const usersMap: Map<number, IUser> = new Map();

app.get("/users", async (req, res) => {
  const allUsers = await prisma.user.findMany();

  res.status(200).json({
    users: allUsers,
  });
  return;
});

app.post("/users", async (req, res) => {
  const { name } = req.body;

  const user = await prisma.user.create({ data: { name } });

  res.status(201).json({ user });
});

app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;

  const user = await prisma.user.findUnique({
    where: { userId: Number(userId) },
  });

  if (!user) {
    res.status(404).json({ error: "user not found!" });
    return;
  }

  res.status(200).json({ user });
});

const VALID_OPS = ["Sum", "Multiply"];
app.post("/calculate", async (req, res) => {
  const { a, b, type } = req.body;

  if (!VALID_OPS.includes(type)) {
    res.status(422).json({ error: "Invalid Operation" });
    return;
  }

  const result = type === "Sum" ? a + b : a * b;

  const data = await prisma.calculation.create({
    data: {
      a,
      b,
      result,
      type,
    },
  });

  res.status(201).json({ result: data.result });
  return;
});
