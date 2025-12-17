import { useQuery, useMutation } from "@tanstack/react-query";
import type { OnuTargetPayload } from '@/services/generated/model';

import { 
  useGetFastCustomerDetailsApiV1CustomerInvoicesGet,
  useGetPsbDataApiV1CustomerPsbGet
} from "@/services/generated/customer/customer";

import {
  getCustomerDetailsApiV1OnuDetailSearchPost
} from "@/services/generated/onu/onu";

import {
  useListRunningTerminalsApiV1CliRunningTerminalsGet
} from "@/services/generated/cli/cli";

import {
  useGetOptionsApiV1ConfigApiOptionsGet,
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

export const useOnuDetails = (payload: OnuTargetPayload) => {
  // Since 'customerDetails' was a POST endpoint not a GET, Orval might generate a mutation 
  // or a query depending on configuration. Based on investigation, it is a POST.
  // Ideally, for data fetching, we wrap it in useQuery.
  return useQuery({
    queryKey: ['onu', 'details', payload],
    queryFn: () => getCustomerDetailsApiV1OnuDetailSearchPost(payload),
    enabled: !!payload.interface,
  });
};

export const useRunningTerminals = () => {
  return useListRunningTerminalsApiV1CliRunningTerminalsGet({
    query: { refetchInterval: 5000 }
  });
};

export const useConfigOptions = () => {
  return useGetOptionsApiV1ConfigApiOptionsGet({
    query: { staleTime: 1000 * 60 * 5 } // 5 mins
  });
};

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

