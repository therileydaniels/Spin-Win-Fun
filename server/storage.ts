import { type Wheel, type InsertWheel, wheels } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getWheelById(id: number): Promise<Wheel | undefined>;
  createWheel(wheel: InsertWheel): Promise<Wheel>;
}

export class DatabaseStorage implements IStorage {
  async getWheelById(id: number): Promise<Wheel | undefined> {
    const result = await db.select().from(wheels).where(eq(wheels.id, id));
    return result[0];
  }

  async createWheel(wheel: InsertWheel): Promise<Wheel> {
    const result = await db.insert(wheels).values(wheel).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
