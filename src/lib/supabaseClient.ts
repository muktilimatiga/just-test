
import { createClient } from '@supabase/supabase-js';
import type { BackendService, Ticket, TicketLog, User, Device, SystemLog } from '../types';

// --- CONFIGURATION ---
// Replace these with your actual Project URL and Anon Key from Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://rrtpzwkdnockcfpvczar.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydHB6d2tkbm9ja2NmcHZjemFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzI3MDksImV4cCI6MjA3OTgwODcwOX0.lW-V0OSe5G8PgAt0i-AA8vC_jsAoLPUeYW_MGmkO0Rw';

// Validate configuration to prevent runtime crashes
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const url = isValidUrl(SUPABASE_URL) ? SUPABASE_URL : 'https://placeholder-project.supabase.co';
const key = SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false // Prevent issues in some sandbox environments
  }
});

export const ApiService: BackendService = {

  /**
   * DASHBOARD & ANALYTICS
   */
  getDashboardStats: async () => {
    // Run counts in parallel for performance
    const [total, open, resolved] = await Promise.all([
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    ]);

    // Calculate average response time (mock calculation for now)
    // In a real implementation, you would calculate this based on actual ticket data
    const avgResponseTime = "2h 15m"; // This could be calculated from ticket timestamps

    return {
      totalTickets: total.count || 0,
      openTickets: open.count || 0,
      resolvedTickets: resolved.count || 0,
      avgResponseTime
    };
  },

  getTrafficData: async () => {
    // NOTE: For complex grouping, it's better to use a Supabase RPC (Postgres function).
    // For now, we fetch last 7 days and calculate client-side.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from('tickets')
      .select('createdAt')
      .gte('createdAt', sevenDaysAgo.toISOString());

    // Transform data to match expected TrafficData format
    // This is a simplified example - in a real implementation you would group by day
    const ticketCount = data?.length || 0;

    return [
      { name: 'Mon', value: Math.floor(ticketCount * 0.1) },
      { name: 'Tue', value: Math.floor(ticketCount * 0.15) },
      { name: 'Wed', value: Math.floor(ticketCount * 0.2) },
      { name: 'Thu', value: Math.floor(ticketCount * 0.15) },
      { name: 'Fri', value: Math.floor(ticketCount * 0.25) },
      { name: 'Sat', value: Math.floor(ticketCount * 0.1) },
      { name: 'Sun', value: Math.floor(ticketCount * 0.05) },
    ];
  },

  getTicketDistribution: async () => {
    // Ideally, create a Postgres View for this: "create view ticket_stats as select status, count(*) ..."
    // This is a client-side approximation:
    const { data } = await supabase.from('tickets').select('status');

    const stats = data?.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(stats || {}).map(key => ({
      name: key.replace('_', ' ').toUpperCase(),
      value: stats[key]
    }));
  },

  /**
   * TICKET MANAGEMENT
   */
  getRecentTickets: async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*') // If you need user names, use: .select('*, assignee:users(name)')
      .order('createdAt', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as Ticket[];
  },

  getTickets: async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data as Ticket[];
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId);

    if (error) {
      console.error("Supabase Update Error:", error.message);
      return false;
    }
    return true;
  },

  getTicketLogs: async (ticketId?: string) => {
    let query = supabase.from('ticket_logs').select('*').order('timestamp', { ascending: false });
    if (ticketId) query = query.eq('ticket_id', ticketId);

    const { data, error } = await query;
    if (error) throw error;
    return data as TicketLog[];
  },

  /**
   * USERS & SEARCH
   */
  getCustomers: async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data as User[];
  },

  searchUsers: async (query: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('name', `%${query}%`); // Case-insensitive search

    if (error) throw error;
    return data as User[];
  },

  searchGlobal: async (query: string) => {
    const [users, tickets] = await Promise.all([
      supabase.from('users').select('*').ilike('name', `%${query}%`),
      supabase.from('tickets').select('*').ilike('title', `%${query}%`),
    ]);

    return {
      users: (users.data || []) as User[],
      tickets: (tickets.data || []) as any[],
      pages: []
    };
  },

  /**
   * SYSTEM & DEVICES
   */
  getTopologies: async () => {
    const { data } = await supabase.from('topologies').select('*');
    return data || [];
  },

  getTableData: async (tableName: string) => {
    // ⚠️ Security Warning: Ensure RLS policies prevent accessing sensitive tables
    const { data } = await supabase.from(tableName).select('*').limit(100);
    return data || [];
  },

  getDevices: async () => {
    const { data, error } = await supabase.from('devices').select('*');
    if (error) throw error;
    return data as Device[];
  },

  getSystemLogs: async () => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data as SystemLog[];
  },

  createSystemLog: async (log) => {
    const { error } = await supabase.from('system_logs').insert(log);
    if (error) console.error("Log creation failed:", error);
  }
};