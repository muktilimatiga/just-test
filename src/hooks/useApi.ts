import { useQuery, useMutation } from "@tanstack/react-query"
import { ApiService } from '@/services/api';
import type { OnuTargetPayload } from '@/services/api';

export const useCustomerInvoices = (query: string) => {
  return useQuery({
    queryKey: ['customer', 'invoices', query],
    queryFn: () => ApiService.customer.getInvoices(query),
    enabled: !!query,
  });
};

export const useOnuDetails = (payload: OnuTargetPayload) => {
  return useQuery({
    queryKey: ['onu', 'details', payload],
    queryFn: () => ApiService.onu.getCustomerDetails(payload),
    enabled: !!payload.interface,
  });
};

export const useRunningTerminals = () => {
  return useQuery({
    queryKey: ['cli', 'terminals'],
    queryFn: () => ApiService.cli.listRunningTerminals(),
    refetchInterval: 5000,
  });
};

export const useConfigOptions = () => {
  return useQuery({
    queryKey: ['config', 'options'],
    queryFn: () => ApiService.config.getOptions(),
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });
};

// --- NEW HOOKS ---

export const usePsbData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['customer', 'psb'],
    queryFn: () => ApiService.customer.getPSBData(),
    enabled, // Only fetch when 'Auto' mode is active
  });
};

export const useScanOnts = () => {
  return useMutation({
    mutationFn: (oltName: string) => ApiService.config.detectUnconfiguredOnts(oltName),
  });
};