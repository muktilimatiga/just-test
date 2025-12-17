import { useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button, Input, Label, Avatar, AvatarFallback } from '@/components/ui';
import { ModalOverlay } from '@/components/ModalOverlay';
import { useTicketStore } from '@/store/ticketStore';
import { useFiberStore } from '@/store/useFiberStore';
import { CustomerCard } from '../customerCard';
import { useAppForm, FormProvider } from '@/components/form/hooks';
import { useActionSuccess, useActionError } from '@/hooks/useActionLog';
import { toast } from 'sonner';

// Import the Strategy Hook we just created
import { useTicketFormStrategy, type TicketMode } from '@/store/useTicketForm';

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: TicketMode;
    ticketData?: any;
}

export const TicketModal = ({ isOpen, onClose, mode, ticketData }: TicketModalProps) => {

    // 1. Get Store Data (Your Database)
    const {
        step, setStep, selectUser, selectedUser,
        formData, initializeFromTicket, reset: resetStore
    } = useTicketStore();

    const {
        searchTerm, setSearchTerm, searchResults, isSearching, searchCustomers, resetSearch
    } = useFiberStore();

    // 2. PARSE STRATEGY (This loads the specific Form + API for the current mode)
    const { title, FormFields, schema, mutation, submitLabel, variant, execute } = useTicketFormStrategy(mode);
    const onSuccessAction = useActionSuccess();
    const onErrorAction = useActionError();

    // 3. Setup Form Engine
    const form = useAppForm({
        defaultValues: {
            name: '',
            address: '',
            description: '',
            priority: 'Low',
            olt_name: '',
            user_pppoe: '',
            onu_sn: '',
            interface: '',
            ticketRef: '',
            type: 'FREE',
            action_ticket: '',
            action_close: '',
            last_action: '',
            service_impact: '',
            root_cause: '',
            network_impact: '',
            person_in_charge: '',
            recomended_action: '',
            PIC: ''
        },

        validators: { onChange: schema },
        onSubmit: async ({ value }) => {
            try {
                await execute(value);
                toast.success(submitLabel + " successful");
                console.log(value);
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

    // 4. Lifecycle & Init
    useEffect(() => {
        if (isOpen) {
            resetStore();
            resetSearch();
            form.reset();

            if (mode === 'create') {
                setStep(1);
            } else if (ticketData) {
                // If Open/Forward/Close, pre-fill store
                initializeFromTicket(ticketData);
                // Try to fetch deeper data (Address, SN, etc.) from data_fiber
                if (ticketData.nama || ticketData.name) {
                    useTicketStore.getState().fetchCustomerByName(ticketData.nama || ticketData.name);
                }
            }
        }
    }, [isOpen, mode, ticketData]);

    // Keep form synced with store
    useEffect(() => {
        if (step === 2 && formData) form.reset(formData);
    }, [step, formData]);

    // Search Debounce (Create Mode Only)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && mode === 'create' && step === 1) searchCustomers(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, isOpen, step, mode]);

    const handleClose = () => {
        onClose();
        setTimeout(() => { resetStore(); resetSearch(); }, 200);
    };

    const handleChangeUser = () => {
  resetStore();   // clears selectedUser + formData + step
  resetSearch();  // clears searchTerm & results
  setStep(1);     // explicit, readable
};


    const handleSelectCustomer = (c: any) => {
        selectUser({
            id: c.id, name: c.name, email: c.user_pppoe, role: 'user',
            alamat: c.alamat, user_pppoe: c.user_pppoe, onu_sn: c.onu_sn, olt_name: c.olt_name
        } as any);
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={handleClose} className="max-w-2xl max-h-[60vh] max-w-[60vh] flex flex-col p-0 overflow-hidden">
            <div className="px-6 py-4 border-b bg-card/50">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Search Step (Create Only) */}
                {step === 1 && mode === 'create' && (
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Find Customer</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" placeholder="Search..." autoFocus />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {isSearching && <div className="text-xs text-center p-4">Searching...</div>}
                            {searchResults.map((c) => (
                                <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-muted rounded cursor-pointer flex gap-3 items-center">
                                    <Avatar className="h-8 w-8 text-xs"><AvatarFallback>{c.name?.[0]}</AvatarFallback></Avatar>
                                    <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.user_pppoe}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unified Form Step */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {selectedUser && <CustomerCard
  user={selectedUser}
  onChangeUser={mode === 'create' ? handleChangeUser : undefined}
/>}
                        <FormProvider value={form}>
                            {/* Renders OpenFields, CloseFields, etc. dynamically */}
                            <FormFields />
                        </FormProvider>
                    </div>
                )}
            </div>

            {/* Footer */}
            {step === 2 && (
                <div className="flex justify-end gap-2 p-6 pt-4 border-t sticky bottom-0 bg-background shadow-lg">
                    <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                        disabled={mutation.isPending}
                        variant={variant}
                    >
                        {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : submitLabel}
                    </Button>
                </div>
            )}
        </ModalOverlay>
    );
};