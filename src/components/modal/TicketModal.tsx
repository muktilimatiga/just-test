import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { Label, Input, Button, Avatar, AvatarFallback } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { ModalOverlay } from '@/components/ModalOverlay'
import { useTicketStore } from '@/store/ticketStore';
import { useFiberStore, type FiberCustomer } from '@/store/useFiberStore'
import { CustomerCard } from '../customerCard';
import { CreateTicketFormFields } from '../form/TicketFromField';
import { useAppForm, FormProvider } from '../form/hooks';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

// Create Ticket, Search Customoer -> Create Ticket
export const CreateTicketModal = () => {

    const {
        isCreateTicketModalOpen,
        setCreateTicketModalOpen,
    } = useAppStore();

    // Ticket Store for Wizard State
    const {
        step,
        setStep,
        selectUser,
        selectedUser,
        formData,
        updateFormData,
        reset: resetTicketStore
    } = useTicketStore();

    // Fiber Store for Search State
    const {
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        searchCustomers,
        resetSearch
    } = useFiberStore();

    // Initialize Form
    const form = useAppForm({
        defaultValues: formData,
        onSubmit: async ({ value }) => {
            updateFormData(value);
            toast.success("Ticket Created");
            handleClose();
        }
    });

    useEffect(() => {
        if (isCreateTicketModalOpen) {
            resetTicketStore();
            resetSearch();
            form.reset(); // Reset form when modal opens
        }
    }, [isCreateTicketModalOpen]);

    // Sync form with store data when step changes to 2 (Customer Selected)
    useEffect(() => {
        if (step === 2 && formData) {
            form.reset(formData);
        }
    }, [step, formData, form]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isCreateTicketModalOpen && step === 1) {
                searchCustomers(searchTerm);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, isCreateTicketModalOpen, step]);

    const handleClose = () => {
        setCreateTicketModalOpen(false);
        setTimeout(() => {
            resetTicketStore();
            resetSearch();
        }, 200);
    };

    const handleSelectCustomer = (fiberCustomer: FiberCustomer) => {
        // Map fiber customer to User type expected by ticketStore
        // Note: casting to any because TicketStore expects Customer type but implementation handles this specific object shape
        const user = {
            id: fiberCustomer.id,
            name: fiberCustomer.name,
            email: fiberCustomer.user_pppoe,
            role: 'user' as const,
            // Store extra fields for form population
            _address: fiberCustomer.alamat,
            _pppoe: fiberCustomer.user_pppoe,
            _sn: fiberCustomer.onu_sn
        };
        selectUser(user as any);
    };

    return (
        <ModalOverlay isOpen={isCreateTicketModalOpen} onClose={handleClose} className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">

                {step === 1 && (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Create Open Ticket</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 rounded-full flex-1 bg-primary" />
                            <div className="h-2 rounded-full flex-1 bg-muted" />
                        </div>

                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="customer-search">Find Customer</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="customer-search"
                                        placeholder="Search by name, PPPoE or address..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="min-h-[200px] border border-border rounded-md p-2">
                                {isSearching && (
                                    <div className="text-center py-8 text-xs text-muted-foreground">Searching...</div>
                                )}
                                {!isSearching && searchResults.length === 0 && searchTerm.length > 1 && (
                                    <p className="text-xs text-muted-foreground text-center py-8">No customers found.</p>
                                )}
                                {!isSearching && searchResults.length === 0 && searchTerm.length <= 1 && (
                                    <p className="text-xs text-muted-foreground text-center py-8">Start typing to search...</p>
                                )}
                                <div className="space-y-1">
                                    {searchResults.map((customer: FiberCustomer) => (
                                        <div
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
                                        >
                                            <Avatar className="h-8 w-8 text-xs">
                                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{customer.user_pppoe} {customer.alamat ? `• ${customer.alamat}` : ''}</p>
                                            </div>
                                            <Badge variant="outline" className="ml-auto text-[10px] whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">Fiber</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && selectedUser && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CustomerCard user={selectedUser} onChangeUser={() => setStep(1)} />
                        <FormProvider value={form}>
                            <CreateTicketFormFields />
                        </FormProvider>
                    </div>
                )}
            </div>

            {step === 2 && selectedUser && (
                <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border bg-background sticky bottom-0 z-10 shadow-lg">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">Create Ticket</Button>
                </div>
            )}
        </ModalOverlay>
    );
};