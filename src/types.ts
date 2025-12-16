
import { z } from 'zod';
import * as React from 'react';

// --- Database Schema Proposal ---
/*
  Proposed SQL Schema (PostgreSQL/Prisma style):

  model User {
    id        String   @id @default(uuid())
    name      String
    email     String   @unique
    role      String   // 'admin', 'noc', 'user'
    avatarUrl String?
    lat       Float?
    lng       Float?function App() {
  return (
    <>
      <Toaster richColors />
      <Launcher />
    </>
  )
}
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
  role: z.enum(['admin', 'noc', 'manager']),
  password: z.string(),
  avatarUrl: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  user_pppoe: z.union([z.string(), z.number()]),
  pass_pppoe: z.union([z.string(), z.number()]).optional(),
  alamat: z.string().optional(),
  onu_sn: z.string().optional(),
  olt_name: z.string().optional(),
  olt_port: z.string().optional(),
  interface: z.string().optional(),
  paket: z.string().optional(),
  snmp_status: z.enum(['active', 'inactive', 'dyinggasp']).optional(),
  rx_power_str: z.string().optional(),
  modem_type: z.string().optional(),
  snmp_last_updated: z.string().optional(),
  latest_kendala: z.string().optional(),
  latest_ticket: z.string().optional(),
  latest_action: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const TicketStatusSchema = z.enum(['open', 'proses', 'fwd teknis', 'closed', 'done']);

export const TicketSchema = z.object({
  ticketId: z.string(),        // TN015623
  kendala: z.string(),         // Issue text
  status: TicketStatusSchema,
  nama: z.string(),        // nama
  PIC: z.string(),
  createdAt: z.string(),       // ISO or yyyy-mm-dd
});


export const TicketLogSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  userId: z.string(),
  userName: z.string(),
  message: z.string(),
  PIC: z.string(),
  createdAt: z.string(),
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

// Payload
export interface CreateTicketPayload {
  query: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  jenis: "FREE" | "PAID";
  noc_username: string;
  noc_password: string;
}


// --- TypeScript Interfaces inferred from Zod ---
export type User = z.infer<typeof UserSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketLog = z.infer<typeof TicketLogSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type TrafficData = z.infer<typeof TrafficDataSchema>;
export type Customer = z.infer<typeof CustomerSchema>;

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