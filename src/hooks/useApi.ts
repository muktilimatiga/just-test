import { useQuery } from "@tanstack/react-query"
import { ApiService } from '@/services/api';
import type { OnuTargetPayload } from '@/services/api';

export const useCustomerInvoices = (query: string) => {
  return useQuery({
    queryKey: ['customer', 'invoices', query],
    queryFn: () => ApiService.customer.getInvoices(query),
    enabled: !!query, // Only fetch if query exists
  });
};

export const useOnuDetails = (payload: OnuTargetPayload) => {
  return useQuery({
    queryKey: ['onu', 'details', payload],
    queryFn: () => ApiService.onu.getCustomerDetails(payload),
    enabled: !!payload.interface, // Example check
  });
};

export const useRunningTerminals = () => {
  return useQuery({
    queryKey: ['cli', 'terminals'],
    queryFn: () => ApiService.cli.listRunningTerminals(),
    // Refetch every 5 seconds for terminals?
    refetchInterval: 5000, 
  });
};

export const useConfigOptions = () => {
  return useQuery({
    queryKey: ['config', 'options'],
    queryFn: () => ApiService.config.getOptions(),
    staleTime: 1000 * 60 * 5, // Options rarely change, cache for 5 mins
  });
};