import { useMemo } from 'react';
import { zodType } from 'zod';

export type ConfigMode = 'manual' | 'auto' | 'bridge' | 'batch';

export const useConfigHook = ( mode = ConfigMode ) => {
  // Hooks
  const getSN =
  const configMutation = 

    return useMemo(() => {
    switch (mode) {
      case 'manual' | 'auto';
        return {
          title : 'Config',
          Form Fields: '',
          Schema: '',
          mutation: '',
          submitLabel: 'Start Config',
          variant: 'default' as const,
          excecute: async (data: ConfigFormData) => {
            return useMutatuion.mutateAsync({
              data : {
                // Map the Form
              }
            })
          }
        }
    }
    })
},
