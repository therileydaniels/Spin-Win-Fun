import { type User, type InsertUser, type SafeUser, users, type Wheel, type InsertWheel, wheels } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSafeUser(user: User): SafeUser;
  getWheelsByUserId(userId: number): Promise<Wheel[]>;
  getWheelById(id: number): Promise<Wheel | undefined>;
  getWheelCountByUserId(userId: number): Promise<number>;
  createWheel(wheel: InsertWheel): Promise<Wheel>;
  updateWheel(id: number, userId: number, data: { name: string; segments: unknown }): Promise<Wheel | undefined>;
  deleteWheel(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      email: insertUser.email.toLowerCase().trim(),
      password: insertUser.password,
      name: insertUser.name,
    }).returning();
    return result[0];
  }

  getSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getWheelsByUserId(userId: number): Promise<Wheel[]> {
    return db.select().from(wheels).where(eq(wheels.userId, userId)).orderBy(desc(wheels.updatedAt));
  }

  async getWheelById(id: number): Promise<Wheel | undefined> {
    const result = await db.select().from(wheels).where(eq(wheels.id, id));
    return result[0];
  }

  async getWheelCountByUserId(userId: number): Promise<number> {
    const result = await db.select().from(wheels).where(eq(wheels.userId, userId));
    return result.length;
  }

  async createWheel(wheel: InsertWheel): Promise<Wheel> {
    const result = await db.insert(wheels).values(wheel).returning();
    return result[0];
  }

  async updateWheel(id: number, userId: number, data: { name: string; segments: unknown }): Promise<Wheel | undefined> {
    const result = await db.update(wheels)
      .set({ 
        name: data.name, 
        segments: data.segments,
        updatedAt: new Date()
      })
      .where(and(eq(wheels.id, id), eq(wheels.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteWheel(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(wheels)
      .where(and(eq(wheels.id, id), eq(wheels.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
