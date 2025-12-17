import { useMemo } from 'react';
import type { TicketFormData } from '@/store/ticketStore';
// Import the GENERATED payload types to ensure safety
import type {
    TicketCreateAndProcessPayload,
    TicketProcessPayload,
    TicketForwardPayload,
    TicketClosePayload
} from '@/services/generated/model';
import {
    useCreateAndProcessTicketApiV1TicketCreateAndProcessPost,
    useCloseTicketApiV1TicketClosePost,
    useForwardTicketApiV1TicketForwardPost,
    useProcessTicketOnlyApiV1TicketProcessPost
} from '@/services/generated/ticket/ticket';
import {
    CreateTicketFormFields, CreateTicketFormSchema,
    OpenTicketFormFields, OpenTicketFormSchema,
    ForwardTicketFormFields, ForwardTicketFormSchema,
    CloseTicketFormFields, CloseTicketFormSchema
} from '@/components/form/TicketFromField';
import { useAppStore } from '@/store';

export type TicketMode = 'create' | 'open' | 'forward' | 'close';

export const useTicketForm = (mode: TicketMode) => {
    // API Hooks
    const createMutation = useCreateAndProcessTicketApiV1TicketCreateAndProcessPost();
    const openMutation = useProcessTicketOnlyApiV1TicketProcessPost();
    const forwardMutation = useForwardTicketApiV1TicketForwardPost();
    const closeMutation = useCloseTicketApiV1TicketClosePost();

    // Credentials
    const user = useAppStore(state => state.user);
    const commonProps = {
        noc_username: user?.email || 'system',
        noc_password: user?.password || 'password'
    };

    return useMemo(() => {
        switch (mode) {
            // Procces Ticket Only -> sending user pppoe only
            case 'open':
                return {
                    title: 'Process Ticket',
                    FormFields: OpenTicketFormFields,
                    schema: OpenTicketFormSchema,
                    mutation: openMutation,
                    submitLabel: 'Process Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        // Explicitly map Store Data -> API Payload
                        const payload: TicketProcessPayload = {
                            query: data.user_pppoe,
                            ...commonProps
                        };
                        return openMutation.mutateAsync({ data: payload });
                    }
                };

            case 'forward':
                // Forward Ticket -> Forward to Technician
                return {
                    title: 'Forward Ticket',
                    FormFields: ForwardTicketFormFields,
                    schema: ForwardTicketFormSchema,
                    mutation: forwardMutation,
                    submitLabel: 'Forward Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        const payload: TicketForwardPayload = {
                            query: data.ticketRef,
                            service_impact: data.service_impact,
                            root_cause: data.root_cause,
                            network_impact: data.network_impact,
                            recomended_action: data.recomended_action,
                            // FIX: Map "interface" to "onu_index" add gpon-onu in front of interface
                            onu_index: `gpon-onu_${data.interface}`,
                            // FIX: Map "onu_sn" to "sn_modem"
                            sn_modem: data.onu_sn,
                            priority: data.priority,
                            person_in_charge: data.person_in_charge || 'ALL TECHNICIAN',  // By Default we ALL TECHNICIAN
                            ...commonProps
                        };
                        return forwardMutation.mutateAsync({ data: payload });
                    }
                };

            case 'close':
                // Close Ticket -> sending query as ticketRef and close_reason from form
                return {
                    title: 'Close Ticket',
                    FormFields: CloseTicketFormFields,
                    schema: CloseTicketFormSchema,
                    mutation: closeMutation,
                    submitLabel: 'Close Ticket',
                    variant: 'destructive' as const,
                    execute: async (data: TicketFormData) => {
                        const payload: TicketClosePayload = {
                            query: data.ticketRef,
                            close_reason: data.action_close,
                            onu_sn: data.onu_sn,
                            ...commonProps
                        };
                        return closeMutation.mutateAsync({ data: payload });
                    }
                };

            case 'create':
            default:
                //  Create Ticket -> sending query as user_pppoe or name and description for kendala use occur from form
                return {
                    title: 'Create New Ticket',
                    FormFields: CreateTicketFormFields,
                    schema: CreateTicketFormSchema,
                    mutation: createMutation,
                    submitLabel: 'Create Ticket',
                    variant: 'default' as const,
                    execute: async (data: TicketFormData) => {
                        const payload: TicketCreateAndProcessPayload = {
                            query: data.user_pppoe || data.name,
                            description: data.description, // Kendala User
                            priority: data.priority || 'LOW', // By default its "LOW"
                            jenis: data.type || 'FREE', // By Default its 'FREE"
                            ...commonProps
                        };
                        return createMutation.mutateAsync({ data: payload });
                    }
                };
        }
    }, [mode, createMutation, openMutation, forwardMutation, closeMutation, user]);
};