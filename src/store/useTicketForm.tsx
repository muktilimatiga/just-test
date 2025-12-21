import { useMemo } from 'react'
import type { TicketFormData } from '@/store/ticketStore'
import type {
  TicketCreateAndProcessPayload,
  TicketProcessPayload,
  TicketForwardPayload,
  TicketClosePayload,
} from '@/services/generated/model'
import {
  useCreateAndProcessTicketApiV1TicketCreateAndProcessPost,
  useCloseTicketApiV1TicketClosePost,
  useForwardTicketApiV1TicketForwardPost,
  useProcessTicketOnlyApiV1TicketProcessPost,
} from '@/services/generated/ticket/ticket'
import {
  CreateTicketFormFields,
  CreateTicketFormSchema,
  OpenTicketFormFields,
  OpenTicketFormSchema,
  ForwardTicketFormFields,
  ForwardTicketFormSchema,
  CloseTicketFormFields,
  CloseTicketFormSchema,
} from '@/components/form/TicketFromField'
import { useAppStore } from '@/store'

export type TicketMode = 'create' | 'open' | 'forward' | 'close'

export const useTicketForm = (mode: TicketMode) => {
  // 1. API Hooks
  const createMutation =
    useCreateAndProcessTicketApiV1TicketCreateAndProcessPost()
  const openMutation = useProcessTicketOnlyApiV1TicketProcessPost()
  const forwardMutation = useForwardTicketApiV1TicketForwardPost()
  const closeMutation = useCloseTicketApiV1TicketClosePost()

  // 2. Credentials
  // FIX: Fallback to '' if user is undefined to satisfy API 'string' requirement
  const user = useAppStore((state) => state.user)
  console.log('Current Redux/Store User:', user)
  const commonProps = {
    noc_username: user?.username || '',
    noc_password: user?.password || '',
  }

  return useMemo(() => {
    switch (mode) {
      // ---------------------------------------------------------
      // 1. PROCESS TICKET (Open)
      // ---------------------------------------------------------
      case 'open':
        return {
          title: 'Process Ticket',
          FormFields: OpenTicketFormFields,
          schema: OpenTicketFormSchema,
          mutation: openMutation,
          submitLabel: 'Process Ticket',
          variant: 'default' as const,
          execute: async (data: TicketFormData) => {
            const payload: TicketProcessPayload = {
              // Logic: Use PPPOE if available, otherwise Name
              query: data.name || data.user_pppoe || '',
              ...commonProps,
            }
            return openMutation.mutateAsync({ data: payload })
          },
        }

      // ---------------------------------------------------------
      // 2. FORWARD TICKET
      // ---------------------------------------------------------
      case 'forward':
        return {
          title: 'Forward Ticket',
          FormFields: ForwardTicketFormFields,
          schema: ForwardTicketFormSchema,
          mutation: forwardMutation,
          submitLabel: 'Forward Ticket',
          variant: 'default' as const,
          execute: async (data: TicketFormData) => {
            // Safety: Construct ONU Index only if interface exists
            const iface = data.interface?.trim()
            const onuIndex = iface ? `gpon-onu_${iface}` : ''

            const payload: TicketForwardPayload = {
              query: data.ticketRef || '',
              service_impact: data.service_impact || '-',
              root_cause: data.root_cause || '-',
              network_impact: data.network_impact || '-',
              recomended_action: data.recomended_action || '-',
              onu_index: onuIndex,
              sn_modem: data.onu_sn || '',
              // Cast these strictly to match the Enum strings expected by API
              priority:
                (data.priority as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
              person_in_charge: data.person_in_charge || 'ALL TECHNICIAN',
              ...commonProps,
            }
            return forwardMutation.mutateAsync({ data: payload })
          },
        }

      // ---------------------------------------------------------
      // 3. CLOSE TICKET
      // ---------------------------------------------------------
      case 'close':
        return {
          title: 'Close Ticket',
          FormFields: CloseTicketFormFields,
          schema: CloseTicketFormSchema,
          mutation: closeMutation,
          submitLabel: 'Close Ticket',
          variant: 'destructive' as const,
          execute: async (data: TicketFormData) => {
            const payload: TicketClosePayload = {
              query: data.ticketRef || '',
              close_reason: data.action_close || 'Ticket Closed by System',
              onu_sn: data.onu_sn || '',
              ...commonProps,
            }
            return closeMutation.mutateAsync({ data: payload })
          },
        }

      // ---------------------------------------------------------
      // 4. CREATE TICKET (Default)
      // ---------------------------------------------------------
      case 'create':
      default:
        return {
          title: 'Create New Ticket',
          FormFields: CreateTicketFormFields,
          schema: CreateTicketFormSchema,
          mutation: createMutation,
          submitLabel: 'Create Ticket',
          variant: 'default' as const,
          execute: async (data: TicketFormData) => {
            const payload: TicketCreateAndProcessPayload = {
              query: data.user_pppoe || data.name || '',
              description: data.description || 'No description provided',
              // Ensure these match your API Enum values exactly
              priority: (data.priority as 'HIGH' | 'MEDIUM' | 'LOW') || 'LOW',
              jenis: (data.type as 'CHARGED' | 'FREE') || 'FREE',
              ...commonProps,
            }
            return createMutation.mutateAsync({ data: payload })
          },
        }
    }
  }, [
    mode,
    createMutation,
    openMutation,
    forwardMutation,
    closeMutation,
    user,
    commonProps,
  ])
}
