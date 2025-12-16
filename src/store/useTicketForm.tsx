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

// 3. Store for Credentials
import { useAppStore } from '@/store';

export type TicketMode = 'create' | 'open' | 'forward' | 'close';

export const useTicketFormStrategy = (mode: TicketMode) => {
    // Hooks
    const createMutation = useCreateAndProcessTicketApiV1TicketCreateAndProcessPost();
    const openMutation = useProcessTicketOnlyApiV1TicketProcessPost();
    const forwardMutation = useForwardTicketApiV1TicketForwardPost();
    const closeMutation = useCloseTicketApiV1TicketClosePost();

    // User Credentials
    const user = useAppStore(state => state.user);
    const noc_username = user?.email || 'system';
    const noc_password = user?.password || 'password'; // Ensure you handle passwords securely in real app

    return useMemo(() => {
        const commonProps = {
            noc_username,
            noc_password
        };

        switch (mode) {
            case 'open':
                return {
                    title: 'Process Ticket',
                    FormFields: OpenTicketFormFields,
                    schema: OpenTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: openMutation,
                    submitLabel: 'Process Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        return openMutation.mutateAsync({
                            data: {
                                query: data.action_ticket || data.ticketRef, // Map action_ticket based on form
                                ...commonProps
                            }
                        });
                    }
                };
            case 'forward':
                return {
                    title: 'Forward Ticket',
                    FormFields: ForwardTicketFormFields,
                    schema: ForwardTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: forwardMutation,
                    submitLabel: 'Forward Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        return forwardMutation.mutateAsync({
                            data: {
                                query: data.ticketRef,
                                service_impact: data.service_impact,
                                root_cause: data.root_cause,
                                network_impact: data.network_impact,
                                recomended_action: data.recomended_action,
                                onu_index: data.interface, // Map interface to onu_index
                                sn_modem: data.onu_sn,     // Map onu_sn to sn_modem
                                priority: data.priority,
                                person_in_charge: data.person_in_charge,
                                ...commonProps
                            }
                        })
                    }
                };
            case 'close':
                return {
                    title: 'Close Ticket',
                    FormFields: CloseTicketFormFields,
                    schema: CloseTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: closeMutation,
                    submitLabel: 'Close Ticket',
                    variant: 'destructive' as const,
                    execute: async (data: TicketFormData) => {
                        return closeMutation.mutateAsync({
                            data: {
                                ticket_id: data.ticketRef, // Check if payload expects query or ticket_id
                                action: data.action_close,
                                ...commonProps
                            } as any // Cast because close payload might differ slightly, verify types!
                        })
                    }
                };
            case 'create':
            default:
                return {
                    title: 'Create New Ticket',
                    FormFields: CreateTicketFormFields,
                    schema: CreateTicketFormSchema as unknown as ZodType<TicketFormData, TicketFormData>,
                    mutation: createMutation,
                    submitLabel: 'Create Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        return createMutation.mutateAsync({
                            data: {
                                query: data.user_pppoe || data.name, // Search by PPPoE
                                description: data.description,
                                priority: data.priority,
                                jenis: data.type,
                                ...commonProps
                            }
                        })
                    }
                };
        }
    }, [mode, createMutation, openMutation, forwardMutation, closeMutation, noc_username, noc_password]);
};