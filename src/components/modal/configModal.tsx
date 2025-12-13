import { ModalOverlay } from '../../components/ModalOverlay';
import { useConfigurationForm } from '@/hooks/useNewConfig';
import { SelectItem } from '@/components/ui/select';
import { FormSelect } from '@/components/form/FormSelect';

export const ConfigModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'basic' | 'bridge' | 'batch' }) => {
  const { 
    form, 
    fieldRules, 
    isSubmitting, 
    modemOptions, 
    packageOptions,
    isLoadingOptions 
  } = useConfigurationForm('default');

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Configure ONU ({type})</h2>
        
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            form.handleSubmit(); 
          }} 
          className="space-y-4"
        >
          {/* KEY CHANGE: Use the 'component' prop with the string key 
            defined in your createFormHook (Input, Select, etc.).
            We pass the FormInput props (label, description) directly to Field.
          */}

          {/* --- Serial Number --- */}
          <form.Field
            name="sn"
            validators={{ onChange: fieldRules.sn }}
            // @ts-ignore - TypeScript doesn't recognize component prop but it works at runtime
            component="Input" as any
            label="Serial Number"
            description="Scan or enter the SN"
            placeholder="ALCL..."
          />

          {/* --- Customer Details --- */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="customer.name"
              validators={{ onChange: fieldRules.customer.shape.name }}
              // @ts-ignore - TypeScript doesn't recognize component prop but it works at runtime
              component="Input" as any
              label="Customer Name"
            />

            <form.Field
              name="customer.address"
              validators={{ onChange: fieldRules.customer.shape.address }}
              // @ts-ignore - TypeScript doesn't recognize component prop but it works at runtime
              component="Input" as any
              label="Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="customer.pppoe_user"
              validators={{ onChange: fieldRules.customer.shape.pppoe_user }}
              // @ts-ignore - TypeScript doesn't recognize component prop but it works at runtime
              component="Input" as any
              label="PPPoE User"
            />

            <form.Field
              name="customer.pppoe_pass"
              validators={{ onChange: fieldRules.customer.shape.pppoe_pass }}
              // @ts-ignore - TypeScript doesn't recognize component prop but it works at runtime
              component="Input" as any
              label="PPPoE Password"
              type="password"
            />
          </div>

          {/* --- Dropdowns --- */}
          <div className="grid grid-cols-2 gap-4">
            {/* For Select, we pass children. 
               The Field component forwards 'children' to FormSelect.
            */}
            <form.Field
              name="modem_type"
              validators={{ onChange: fieldRules.modem_type }}
            >
              {() => (
                <FormSelect
                  label="Modem Type"
                  disabled={isLoadingOptions}
                >
                  {modemOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </FormSelect>
              )}
            </form.Field>

            <form.Field
              name="package"
              validators={{ onChange: fieldRules.package }}
            >
              {() => (
                <FormSelect
                  label="Package"
                  disabled={isLoadingOptions}
                >
                  {packageOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </FormSelect>
              )}
            </form.Field>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Start Configuration'}
            </button>
          </div>

        </form>
      </div>
    </ModalOverlay>
  );
};