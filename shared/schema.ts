import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const solves = pgTable("solves", {
  id: serial("id").primaryKey(),
  scramble: text("scramble").notNull(),
  solution: json("solution").notNull(), // array of moves
  moveCount: integer("move_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSolveSchema = createInsertSchema(solves).omit({ id: true, createdAt: true });

export type Solve = typeof solves.$inferSelect;
export type InsertSolve = z.infer<typeof insertSolveSchema>;
