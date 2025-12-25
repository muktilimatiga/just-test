import { useMutation, keepPreviousData } from '@tanstack/react-query'
import type {
  ConfigurationRequest,
  OnuTargetPayload,
} from '@/services/generated/model'

import {
  useGetFastCustomerDetailsApiV1CustomerInvoicesGet,
  useGetPsbDataApiV1CustomerPsbGet,
} from '@/services/generated/customer/customer'

import {
  // useGetOptionsApiV1ConfigApiOptionsGet,
  detectUncfgOntsApiV1ConfigApiOltsOltNameDetectOntsGet,
  runConfigurationApiV1ConfigApiOltsOltNameConfigurePost,
} from '@/services/generated/config/config'

// Re-export types if needed by consumers
export type { OnuTargetPayload }
export type { ConfigurationRequest }

export const useCustomerInvoices = (query: string) => {
  return useGetFastCustomerDetailsApiV1CustomerInvoicesGet(
    { query },
    {
      query: {
        // 1. SAFETY: Only fetch if query is valid and has at least 3 characters
        // This prevents searching for "A" or "1" which usually returns too much data
        enabled: !!query && query.length >= 3,

        // 2. STABILITY: Keep data fresh for 1 minute.
        // If the user closes/reopens the modal instantly, it won't fetch again.
        staleTime: 1000 * 60,

        // 3. UX: Don't refetch when user clicks away to WhatsApp and comes back
        refetchOnWindowFocus: false,

        // 4. PERFORMANCE: If typing "Sugeng" -> "Sugeng S", keep showing "Sugeng"
        // results until the new ones arrive. Prevents the "Loading..." flash.
        placeholderData: keepPreviousData,

        // 5. ERROR HANDLING: specific retry logic (don't retry 3 times if 404)
        retry: 1,
      },
    },
  )
}

// export const useConfigOptions = () => {
//   return useGetOptionsApiV1ConfigApiOptionsGet({
//     query: { staleTime: 1000 * 60 * 5 } // 5 mins
//   });
// };

// --- NEW HOOKS ---

export const usePsbData = () => {
  return useGetPsbDataApiV1CustomerPsbGet({
    query: { staleTime: Infinity, enabled: false },
  })
}

export const useScanOnts = () => {
  return useMutation({
    mutationFn: (oltName: string) =>
      detectUncfgOntsApiV1ConfigApiOltsOltNameDetectOntsGet(oltName),
  })
}

export const configMutation = () => {
  return useMutation({
    mutationFn: ({
      oltName,
      data,
    }: {
      oltName: string
      data: ConfigurationRequest
    }) => runConfigurationApiV1ConfigApiOltsOltNameConfigurePost(oltName, data),
  })
}
