import { db } from "./db";
import {
  solves,
  type Solve,
  type InsertSolve,
} from "@shared/schema";

export interface IStorage {
  getSolves(): Promise<Solve[]>;
  createSolve(solve: InsertSolve): Promise<Solve>;
}

export class DatabaseStorage implements IStorage {
  async getSolves(): Promise<Solve[]> {
    return await db.select().from(solves);
  }

  async createSolve(solve: InsertSolve): Promise<Solve> {
    const [created] = await db.insert(solves)
      .values(solve)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
