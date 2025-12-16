import { useMemo } from 'react';
import { ZodType } from 'zod';
import type { TicketFormData } from '@/store/ticketStore';
// 1. API Hooks (The Engines)
import {
    useCreateAndProcessTicketApiV1TicketCreateAndProcessPost,
    useCloseTicketApiV1TicketClosePost,
    useForwardTicketApiV1TicketForwardPost,
    useProcessTicketOnlyApiV1TicketProcessPost
} from '@/services/generated/ticket/ticket';

// 2. Form UI & Schemas (The Body)
import {
    CreateTicketFormSchema, CreateTicketFormFields,
    OpenTicketFormSchema, OpenTicketFormFields,
    ForwardTicketFormSchema, ForwardTicketFormFields,
    CloseTicketFormSchema, CloseTicketFormFields
} from '@/components/form/TicketFromField';

export type TicketMode = 'create' | 'open' | 'forward' | 'close';

export const useTicketFormStrategy = (mode: TicketMode) => {

    const createMutation = useCreateAndProcessTicketApiV1TicketCreateAndProcessPost();
    const openMutation = useProcessTicketOnlyApiV1TicketProcessPost();
    const forwardMutation = useForwardTicketApiV1TicketForwardPost();
    const closeMutation = useCloseTicketApiV1TicketClosePost();

    return useMemo(() => {
        switch (mode) {
            case 'open':
                return {
                    title: 'Process Ticket',
                    FormFields: OpenTicketFormFields,
                    // 👇 CAST THE SCHEMA HERE
                    schema: OpenTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: openMutation,
                    submitLabel: 'Process Ticket',
                    variant: 'default' as const
                };
            case 'forward':
                return {
                    title: 'Forward Ticket',
                    FormFields: ForwardTicketFormFields,
                    // 👇 CAST THE SCHEMA HERE
                    schema: ForwardTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: forwardMutation,
                    submitLabel: 'Forward Ticket',
                    variant: 'default' as const
                };
            case 'close':
                return {
                    title: 'Close Ticket',
                    FormFields: CloseTicketFormFields,
                    // 👇 CAST THE SCHEMA HERE
                    schema: CloseTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: closeMutation,
                    submitLabel: 'Close Ticket',
                    variant: 'destructive' as const
                };
            case 'create':
            default:
                return {
                    title: 'Create New Ticket',
                    FormFields: CreateTicketFormFields,
                    // 👇 CAST THE SCHEMA HERE
                    schema: CreateTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: createMutation,
                    submitLabel: 'Create Ticket',
                    variant: 'default' as const
                };
        }
    }, [mode, createMutation, openMutation, forwardMutation, closeMutation]);
};