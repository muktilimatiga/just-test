import { useMemo } from 'react';
// 1. Import Generated API Hooks
import {
  useRunConfigurationApiV1ConfigApiOltsOltNameConfigurePost,
  // useRunConfigurationBatchApiV1ConfigApiOltsOltNameConfigureBatchPost
} from '@/services/generated/config/config';

import type {
  ConfigurationRequest,
  // BatchConfigurationRequest
} from '@/services/generated/model';

// 2. Import UI & Schemas
import {
  ConfigFormFields,   // ✅ IMPORT THIS (Replaces AutoFields & ManualFields)
  ConfigManualSchema, // ✅ Keep this
  ConfigAutoSchema,   // ✅ Keep this
  // ConfigBatchSchema
} from '@/components/form/configFormFields';

export type ConfigMode = 'manual' | 'auto' | 'bridge' | 'batch';

export const useConfigMutation = (mode: ConfigMode, selectedOlt: string) => {

  const singleConfigMutation = useRunConfigurationApiV1ConfigApiOltsOltNameConfigurePost();
  // const batchConfigMutation = useRunConfigurationBatchApiV1ConfigApiOltsOltNameConfigureBatchPost();

  return useMemo(() => {
    switch (mode) {
      //     case 'batch':
      //       return {
      //         title: 'Batch Configuration',
      //         FormFields: ConfigBatchFields,
      //         // ✅ FIX: Cast to 'any' to bypass strict TanStack Form type checks
      //         schema: ConfigBatchSchema as any,
      //         mutation: batchConfigMutation,
      //         submitLabel: 'Run Batch Config',
      //         execute: async (data: any, batchQueue: any[]) => {
      //           const payload: BatchConfigurationRequest = {
      //             configs: batchQueue.map((item) => ({
      //               sn: item.sn,
      //               name: item.customer?.name || 'Unknown',
      //               address: item.customer?.address || 'Unknown',
      //               pppoe_user: item.customer?.pppoe || 'user',
      //               pppoe_pass: '123456',
      //               modem_type: data.modem_type,
      //               paket: data.package,
      //               eth_locks: [false, false, false, false],
      //               customer: {
      //                 name: item.customer?.name || 'Unknown',
      //                 address: item.customer?.address || 'Unknown',
      //                 pppoe_user: item.customer?.pppoe || 'user',
      //                 pppoe_pass: '123456',
      //               } as any
      //             }))
      //           };
      //           return batchConfigMutation.mutateAsync({ oltName: selectedOlt, data: payload });
      //         }
      //       };

      case 'auto':
        return {
          title: 'Auto Configuration',
          FormFields: ConfigFormFields,
          // ✅ FIX: Cast to 'any'
          schema: ConfigAutoSchema as any,
          mutation: singleConfigMutation,
          submitLabel: 'Configure Device',
          execute: async (data: any) => {
            const payload: ConfigurationRequest = {
              sn: data.onu_sn,
              modem_type: data.modem_type,
              package: data.package,
              eth_locks: data.eth_locks || [true] || [false],
              customer: {
                name: data.name,
                address: data.address,
                pppoe_user: data.user_pppoe,
                pppoe_pass: data.pass_pppoe,
              } as any
            };
            return singleConfigMutation.mutateAsync({ oltName: selectedOlt, data: payload });
          }
        };

      case 'manual':
      default:
        return {
          title: 'Manual Configuration',
          FormFields: ConfigFormFields,
          // ✅ FIX: Cast to 'any'
          schema: ConfigManualSchema as any,
          mutation: singleConfigMutation,
          submitLabel: 'Configure Device',
          execute: async (data: any) => {
            const payload: ConfigurationRequest = {
              sn: data.onu_sn,
              package: data.package,
              modem_type: data.modem_type,
              eth_locks: data.eth_locks || [true] || [false], // Default true
              customer: {
                name: data.name,
                address: data.address,
                pppoe_user: data.user_pppoe,
                pppoe_pass: data.pass_pppoe,
              } as any
            };
            return singleConfigMutation.mutateAsync({ oltName: selectedOlt, data: payload });
          }
        };
    }
  }, [mode, selectedOlt, singleConfigMutation]);
};