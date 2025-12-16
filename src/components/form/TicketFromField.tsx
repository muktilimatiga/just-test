
import { FieldWrapper } from './FieldWrapper';


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






export const CreateTicketFormFields = () => {
    return (
        <div className="p-6 space-y-5">
            <FieldWrapper name="name" label="Full Name" component="Input" />
            <FieldWrapper name="address" label="Installation Address" component="Input" />

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper name="contact" label="Contact Number" component="Input" />
                <FieldWrapper name="noInternet" label="No Internet ID" component="Input" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FieldWrapper name="ticketRef" label="Reference" component="Input" readOnly />

                <FieldWrapper name="priority" label="Priority" component="Select">
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </FieldWrapper>

                <FieldWrapper name="type" label="Type" component="Select">
                    <option value="">Select...</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Sales">Sales</option>
                    <option value="Complaint">Complaint</option>
                </FieldWrapper>
            </div>

            <FieldWrapper
                name="description"
                label="Problem Description"
                component="Textarea"
                rows={4}
            />
        </div>
    );
};
