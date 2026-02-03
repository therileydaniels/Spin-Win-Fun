import { type User, type InsertUser, type SafeUser, users, type Wheel, type InsertWheel, wheels } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, gte, ilike, sql } from "drizzle-orm";

export interface AdminStats {
  totalUsers: number;
  usersByRole: { free: number; paid: number; admin: number };
  totalWheels: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserWithWheelCount extends SafeUser {
  wheelsCount: number;
}

export interface PaginatedUsers {
  users: UserWithWheelCount[];
  total: number;
  page: number;
  totalPages: number;
}

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
  getAdminStats(): Promise<AdminStats>;
  getAllUsersWithWheelCount(page: number, limit: number, search?: string): Promise<PaginatedUsers>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  deleteUserAndWheels(id: number): Promise<boolean>;
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
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(wheels)
      .where(eq(wheels.userId, userId));
    return Number(result[0]?.count ?? 0);
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

  async getAdminStats(): Promise<AdminStats> {
    const allUsers = await db.select().from(users);
    const allWheels = await db.select().from(wheels);
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const usersByRole = { free: 0, paid: 0, admin: 0 };
    let newUsersThisWeek = 0;
    let newUsersThisMonth = 0;
    
    for (const user of allUsers) {
      const role = user.role as 'free' | 'paid' | 'admin';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
      
      const createdAt = new Date(user.createdAt);
      if (createdAt >= oneWeekAgo) newUsersThisWeek++;
      if (createdAt >= oneMonthAgo) newUsersThisMonth++;
    }
    
    return {
      totalUsers: allUsers.length,
      usersByRole,
      totalWheels: allWheels.length,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  }

  async getAllUsersWithWheelCount(page: number, limit: number, search?: string): Promise<PaginatedUsers> {
    let baseQuery = db.select().from(users);
    
    if (search && search.trim()) {
      baseQuery = baseQuery.where(ilike(users.email, `%${search.trim()}%`)) as typeof baseQuery;
    }
    
    const allFilteredUsers = await baseQuery.orderBy(desc(users.createdAt));
    const total = allFilteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    
    const offset = (page - 1) * limit;
    const paginatedUsers = allFilteredUsers.slice(offset, offset + limit);
    
    const usersWithWheelCount: UserWithWheelCount[] = await Promise.all(
      paginatedUsers.map(async (user) => {
        const wheelCount = await this.getWheelCountByUserId(user.id);
        const { password, ...safeUser } = user;
        return {
          ...safeUser,
          wheelsCount: wheelCount,
        };
      })
    );
    
    return {
      users: usersWithWheelCount,
      total,
      page,
      totalPages,
    };
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    if (!['free', 'paid', 'admin'].includes(role)) {
      return undefined;
    }
    
    const result = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async deleteUserAndWheels(id: number): Promise<boolean> {
    await db.delete(wheels).where(eq(wheels.userId, id));
    
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
