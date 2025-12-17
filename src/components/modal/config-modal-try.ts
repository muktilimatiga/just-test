
import { ModalOverlay } from '@/components/ModalOverlay';
import { useFiberStore } from '@/store/useFiberStore';
import { useAppForm, FormProvider } from '@/components/form/hooks';
import { useActionSuccess, useActionError } from '@/hooks/useActionLog';
import { toast } from 'sonner';


interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: ConfigMode;
    ticketData?: any;
}

export const ConfigModal({ isOpen, onClose, mode, ConfigData}): ConfigModalProps => {

  const {
        searchTerm, setSearchTerm, searchResults, isSearching, searchCustomers, resetSearch
    } = useFiberStore();

    const onSuccessAction = useActionSuccess();
    const onErrorAction = useActionError();

  const form = useAppform({
    defaultValues : {
      olt_name: '',
      modem_type: '',
      package: '',
      onu_sn: '',
      name: '',
      address: '',
      user_pppoe: '',
      pass_pppoe: '',
      eth_loc: '',
    },

    validator: { onChange: schema},
        onSubmit: async ({ value }) => {
            try {
                await execute(value);
                toast.success(submitLabel + " successful");
                onSuccessAction(value, {
                    title,
                    action: mode === 'create' ? "create" : "update", // Dynamic action logging
                    target: "ticket",
                    onDone: handleClose,
                });
            } catch (error) {
                toast.error("An error occurred");
                console.error(error);
                onErrorAction(error as any, mode === 'create' ? "create" : "update", "ticket");
            }
        }
    });

      const handleClose = () => {
        onClose();
        setTimeout(() => { resetStore(); resetSearch(); }, 200);
    };

      const handleSelectCustomer = (c: any) => {
          selectUser({
              id: c.id, name: c.name, email: c.user_pppoe, role: 'user',
              _address: c._address, _pppoe: c._pppoe, _sn: c._sn, _olt: c._olt
          } as any);
      };
}
