import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { supabase } from '@/lib/supabaseClient';

// Define the shape of a Log Entry
export type LogEntry = {
    action: string;
    target: string;
    details?: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
};

export const useActivityLogger = () => {
    const { user } = useAppStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entry: LogEntry) => {
            const payload = {
                ...entry,
                user_id: user?.id || 'anonymous',
                user_name: user?.name || 'System',
                timestamp: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("log_activity")
                .insert([payload])
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['log_activity'] });
        },
        onError: (error) => {
            console.error("Failed to save activity log", error);
        }
    });
};