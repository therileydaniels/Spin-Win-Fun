import { type User, type InsertUser, type SafeUser, users, type Wheel, type InsertWheel, wheels } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, gte, ilike, sql } from "drizzle-orm";

function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

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
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Single query for all user stats using SQL aggregations
    const userStatsResult = await db.select({
      totalUsers: sql<number>`count(*)`,
      freeCount: sql<number>`count(*) filter (where ${users.role} = 'free')`,
      paidCount: sql<number>`count(*) filter (where ${users.role} = 'paid')`,
      adminCount: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
      newUsersThisWeek: sql<number>`count(*) filter (where ${users.createdAt} >= ${oneWeekAgo})`,
      newUsersThisMonth: sql<number>`count(*) filter (where ${users.createdAt} >= ${oneMonthAgo})`,
    }).from(users);
    
    // Single query for wheel count
    const wheelCountResult = await db.select({
      totalWheels: sql<number>`count(*)`,
    }).from(wheels);
    
    const stats = userStatsResult[0];
    const wheelStats = wheelCountResult[0];
    
    return {
      totalUsers: Number(stats?.totalUsers ?? 0),
      usersByRole: {
        free: Number(stats?.freeCount ?? 0),
        paid: Number(stats?.paidCount ?? 0),
        admin: Number(stats?.adminCount ?? 0),
      },
      totalWheels: Number(wheelStats?.totalWheels ?? 0),
      newUsersThisWeek: Number(stats?.newUsersThisWeek ?? 0),
      newUsersThisMonth: Number(stats?.newUsersThisMonth ?? 0),
    };
  }

  async getAllUsersWithWheelCount(page: number, limit: number, search?: string): Promise<PaginatedUsers> {
    const offsetVal = (page - 1) * limit;
    const searchPattern = search?.trim() ? `%${escapeLikePattern(search.trim())}%` : null;
    const searchCondition = searchPattern ? ilike(users.email, searchPattern) : undefined;
    
    const userSelect = {
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      wheelsCount: sql<number>`count(${wheels.id})`.as('wheels_count'),
    };
    
    const baseQuery = db
      .select(userSelect)
      .from(users)
      .leftJoin(wheels, eq(users.id, wheels.userId))
      .$dynamic();
    
    const usersResult = await (searchCondition
      ? baseQuery.where(searchCondition)
      : baseQuery
    )
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offsetVal);
    
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(users).$dynamic();
    const countResult = await (searchCondition
      ? countQuery.where(searchCondition)
      : countQuery
    );
    
    const total = Number(countResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);
    
    const usersWithWheelCount: UserWithWheelCount[] = usersResult.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      wheelsCount: Number(user.wheelsCount ?? 0),
    }));
    
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
