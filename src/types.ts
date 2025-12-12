
import { z } from 'zod';
import * as React from 'react';

// --- Database Schema Proposal ---
/*
  Proposed SQL Schema (PostgreSQL/Prisma style):

  model User {
    id        String   @id @default(uuid())
    name      String
    email     String   @unique
    role      String   // 'admin', 'agent', 'user'
    avatarUrl String?
    lat       Float?
    lng       Float?
    tickets   Ticket[]
    logs      TicketLog[]
  }

  model Ticket {
    id          String      @id @default(uuid())
    title       String
    status      String      // 'open', 'in_progress', 'resolved', 'closed'
    priority    String      // 'low', 'medium', 'high', 'critical'
    assigneeId  String?
    assignee    User?       @relation(fields: [assigneeId], references: [id])
    createdAt   DateTime    @default(now())
    updatedAt   DateTime    @updatedAt
    logs        TicketLog[]
  }

  model TicketLog {
    id        String   @id @default(uuid())
    ticketId  String
    ticket    Ticket   @relation(fields: [ticketId], references: [id])
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    message   String
    createdAt DateTime @default(now())
  }
*/

// --- Zod Schemas ---

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'agent', 'user']),
  avatarUrl: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const TicketStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);
export const TicketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TicketSchema = z.object({
  id: z.string(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  assigneeId: z.string().nullable(),
  createdAt: z.string().datetime(), // ISO string for frontend
});

export const TicketLogSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  userId: z.string(),
  userName: z.string(),
  message: z.string(),
  createdAt: z.string().datetime(),
});

export const DashboardStatsSchema = z.object({
  totalTickets: z.number(),
  openTickets: z.number(),
  resolvedTickets: z.number(),
  avgResponseTime: z.string(), // e.g. "2h 15m"
});

export const TrafficDataSchema = z.array(z.object({
  name: z.string(),
  value: z.number(),
}));

// --- TypeScript Interfaces inferred from Zod ---
export type User = z.infer<typeof UserSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketLog = z.infer<typeof TicketLogSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type TrafficData = z.infer<typeof TrafficDataSchema>;

export interface Device {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  folder: string;
  type: string;
  ping: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string; // e.g., 'Invoice', 'Database', 'Ticket'
  message: string;
  user?: string;
  metadata?: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  link?: string;
}

// --- App Types ---
export type NavItem = {
  label: string;
  icon: React.ElementType;
  to: string;
};

// --- Realtime Types ---
export type RealtimeEvent = 
  | { type: 'NEW_TICKET'; payload: Ticket }
  | { type: 'NEW_LOG'; payload: TicketLog };

// --- Service Interface ---
// This ensures both your MockService and your Real Backend Service implement the same methods.
export interface BackendService {
  getDashboardStats: () => Promise<DashboardStats>;
  getTrafficData: () => Promise<TrafficData>;
  getTicketDistribution: () => Promise<{ name: string; value: number }[]>;
  getRecentTickets: () => Promise<Ticket[]>;
  getTickets: () => Promise<Ticket[]>;
  getCustomers: () => Promise<User[]>;
  getTopologies: () => Promise<any[]>;
  getTableData: (tableName: string) => Promise<any[]>;
  getTicketLogs: (ticketId?: string) => Promise<TicketLog[]>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  searchGlobal: (query: string) => Promise<{ users: User[]; tickets: any[]; pages: any[] }>;
  getDevices: () => Promise<Device[]>;
  getSystemLogs: () => Promise<SystemLog[]>;
  createSystemLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => Promise<void>;
}