import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { supabase } from '@/lib/supabaseClient';

// Define the shape of a Log Entry
export type LogEntry = {
    action: string;
    target: string;
    details?: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
};

export type LogRecord = LogEntry & {
    id: number;
    user_id: string;
    timestamp: string;
    created_at: string;
}

export const useActivityLogger = () => {
    const { user } = useAppStore();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (entry: LogEntry) => {
            const payload = {
                ...entry,
                user_id: user?.id ?? 'anonymous',
                user_name: user?.name ?? 'System',
                timestamp: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("log_activity")
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['log_activity'] });
        },
    });

    return {
        logActivity: mutation.mutate,
        logActivityAsync: mutation.mutateAsync,
        ...mutation,
    };
};

export const useActivityLog = () => {
    return useQuery({
        queryKey: ['log_activity'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("log_activity")
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data as LogRecord[];
        },
    })
}