import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.solves.list.path, async (req, res) => {
    try {
      const allSolves = await storage.getSolves();
      res.status(200).json(allSolves);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch solves" });
    }
  });

  app.post(api.solves.create.path, async (req, res) => {
    try {
      const input = api.solves.create.input.parse(req.body);
      const newSolve = await storage.createSolve(input);
      res.status(201).json(newSolve);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create solve" });
    }
  });

  return httpServer;
}
