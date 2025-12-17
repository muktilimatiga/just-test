// useConfigurationForm.ts
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppForm } from '@/components/form/hooks';
// Assuming useConfigOptions is the React Query hook we defined in api.ts
import { useConfigOptions } from './useApi'
import { AXIOS_INSTANCE as axios } from '@/services/api';
// --- Schema matches your ConfigurationRequest interface ---
const ConfigurationSchema = z.object({
  sn: z.string().min(1, "Serial number is required"),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    address: z.string().min(1, "Address is required"),
    pppoe_user: z.string().min(1, "PPPoE username is required"),
    pppoe_pass: z.string().min(1, "PPPoE password is required"),
  }),
  modem_type: z.string().min(1, "Modem type is required"),
  package: z.string().min(1, "Package is required"),
  eth_locks: z.array(z.boolean()),
});

type UserFormValues = z.infer<typeof ConfigurationSchema>;

export const useConfigurationForm = (oltName: string = 'default') => {
  const { data: configOptions, isLoading: isLoadingOptions } = useConfigOptions();

  // --- MUTATION uses ApiService ---
  const mutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await axios.post<{ message: string }>(`/api/v1/config/run-configuration`, { olt_name: oltName, ...data });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Configuration success: ${data.message}`);
    },
    onError: (err) => {
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    },
  });

  const form = useAppForm({
    defaultValues: {
      sn: '',
      customer: { name: '', address: '', pppoe_user: '', pppoe_pass: '' },
      modem_type: '',
      package: '',
      eth_locks: [false, false, false, false],
    } as UserFormValues,

    // Note: validatorAdapter is removed (Zod 3.24+ native support)
    
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return {
    form,
    mutation,
    isSubmitting: form.state.isSubmitting || mutation.isPending,
    fieldRules: ConfigurationSchema.shape,
    modemOptions: configOptions?.modem_options ?? [],
    packageOptions: configOptions?.package_options ?? [],
    isLoadingOptions,
  };
};