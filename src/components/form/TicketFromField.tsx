
import { FieldWrapper } from './FieldWrapper';
import { FormInput } from './FormInput'

export interface CreateTicketFormData {
    name: string;
    address: string;
    contact: string;
    noInternet: string;
    ticketRef: string;
    priority: string;
    type: string;
    description: string;
}

export interface ForwardTicketFormData {
    ticketRef: string;
    priority: string;
    type: string;
    description: string;
}

export interface CloseTicketFormData {
    ticketRef: string;
    priority: string;
    type: string;
    description: string;
}






export const TicketFormFields = () => {
    return (
        <div className="p-6 space-y-5">
            <div className="space-y-2">
                <FieldWrapper
                    name="name"
                    label="Full Name"
                    component={FormInput}
                    placeholder="Enter full name"
                    className="bg-muted/50"
                />
            </div>

            <div className="space-y-2">
                <FieldWrapper
                    name="address"
                    label="Installation Address"
                    component={FromInput}
                    placeholder="Enter installation address"
                    className="bg-muted/50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <FieldWrapper
                        name="contact"
                        label="Contact Number"
                        component={FromInput}
                        placeholder="Enter contact number"
                        className="bg-muted/50"
                    />
                </div>
                <div className="space-y-2">
                    <FieldWrapper
                        name="noInternet"
                        label="No Internet ID"
                        component={FromInput}
                        placeholder="Enter No Internet ID"
                        className="bg-muted/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <FieldWrapper
                        name="ticketRef"
                        label="Reference"
                        component={FromInput}
                        readOnly
                        className="bg-muted text-muted-foreground cursor-not-allowed font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <FieldWrapper
                        name="priority"
                        label="Priority"
                        component={FromInput}
                    >
                        <option value="">Select...</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </FieldWrapper>
                </div>
                <div className="space-y-2">
                    <FieldWrapper
                        name="type"
                        label="Type"
                        component={FromInput}
                    >   
                        <option value="">Select...</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Sales">Sales</option>
                        <option value="Complaint">Complaint</option>
                    </FieldWrapper>
                </div>
            </div>

            <div className="space-y-2">
                <FieldWrapper
                    name="description"
                    label="Problem Description"
                    component={FromInput}
                    rows={4}
                    className="resize-none bg-muted/50 focus:ring-2 focus:ring-ring"
                    placeholder="Describe the customer's issue in detail..."
                />
            </div>
        </div>
    );
};