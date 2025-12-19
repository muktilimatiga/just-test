import { useQuery, useMutation } from "@tanstack/react-query";
import type { OnuTargetPayload } from '@/services/generated/model';

import {
  useGetFastCustomerDetailsApiV1CustomerInvoicesGet,
  useGetPsbDataApiV1CustomerPsbGet
} from "@/services/generated/customer/customer";


import {
  // useGetOptionsApiV1ConfigApiOptionsGet,
  detectUncfgOntsApiV1ConfigApiOltsOltNameDetectOntsGet
} from "@/services/generated/config/config";

// Re-export types if needed by consumers
export type { OnuTargetPayload };

export const useCustomerInvoices = (query: string) => {
  return useGetFastCustomerDetailsApiV1CustomerInvoicesGet(
    { query },
    { query: { enabled: !!query } }
  );
};

// export const useConfigOptions = () => {
//   return useGetOptionsApiV1ConfigApiOptionsGet({
//     query: { staleTime: 1000 * 60 * 5 } // 5 mins
//   });
// };

// --- NEW HOOKS ---

export const usePsbData = (enabled: boolean = true) => {
  return useGetPsbDataApiV1CustomerPsbGet({
    query: { enabled }
  });
};

export const useScanOnts = () => {
  return useMutation({
    mutationFn: (oltName: string) => detectUncfgOntsApiV1ConfigApiOltsOltNameDetectOntsGet(oltName),
  });
};

