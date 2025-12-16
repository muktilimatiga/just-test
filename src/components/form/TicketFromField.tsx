
import { FieldWrapper } from './FieldWrapper';
import { z } from 'zod';


export const DefaultFormSchema = z.object({
    name: z.string(),
    address: z.string(),
    description: z.string(),
})

export const TicketFormSchema = DefaultFormSchema.extend({
    interface: z.string(),
    onu_sn: z.string(),
})

export const CreateTicketFormSchema = DefaultFormSchema.extend({
    olt_name:z.string(),
    user_pppoe: z.string(),
    ticketRef: z.string(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    type: z.enum(['FREE', 'CHARGED']),
})

export const OpenTicketFormSchema = TicketFormSchema.omit({
    onu_sn: true,
}).extend({
    olt_name: z.string(),
    action_ticket: z.string(),
})

export const ForwardTicketFormSchema = TicketFormSchema.extend({
    last_action: z.string(),
    service_impact: z.string(),
    root_cause: z.string(),
    network_impact: z.string(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    person_in_charge: z.string(),
    recomended_action: z.string(),
})

export const CloseTicketFormSchema = TicketFormSchema.pick({
    name: true,
    address: true,
    onu_sn: true,
}).extend({
    action_close: z.string(),
})

export type DefaultFormData = z.infer<typeof DefaultFormSchema>;
export type CreateFormTicketData = z.infer<typeof CreateTicketFormSchema>;
export type OpenFormTicketData = z.infer<typeof OpenTicketFormSchema>;
export type ForwardFormTicketData = z.infer<typeof ForwardTicketFormSchema>;
export type CloseFormTicketData = z.infer<typeof CloseTicketFormSchema>;


export function DefaultFormFields() {
    return (
        <div className="space-y-4">
            <FieldWrapper name="name" label="Full Name" component="Input" />
            <FieldWrapper name="address" label="Address" component="Input" />
            <FieldWrapper name="description" label="Description" component="Textarea" />
        </div>
    );
}

export function CreateTicketFormFields() {
    return (
        <div className="p-6 space-y-5">
            <FieldWrapper name="name" label="Customer Name" component="Input" />
            <FieldWrapper name="address" label="Customer Address" component="Input" />

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper name="olt_name" label="OLT Name" component="Input" />
                <FieldWrapper name="user_pppoe" label="User PPPOE" component="Input" />
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
                    <option value="FREE">Free</option>
                    <option value="CHARGED">Charged</option>
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
}

export function OpenTicketFormFields() {
    return (
        <div className="space-y-4">
            <FieldWrapper name="name" label="Full Name" component="Input" />
            <FieldWrapper name="address" label="Address" component="Input" />
            <FieldWrapper name="olt_name" label="OLT Name" component="Input" />
            <FieldWrapper name="interface" label="Interface" component="Input" />
            <FieldWrapper name="action_ticket" label="Action Ticket" component="Input" />
            <FieldWrapper name="description" label="Description" component="Textarea" />
        </div>
    );
}

export function ForwardTicketFormFields() {
    return (
        <div className="space-y-4">
            <FieldWrapper name="name" label="Full Name" component="Input" />
            <FieldWrapper name="address" label="Address" component="Input" />
            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper name="interface" label="Interface" component="Input" />
                <FieldWrapper name="onu_sn" label="ONU SN" component="Input" />
            </div>

            <FieldWrapper name="priority" label="Priority" component="Select">
                <option value="">Select...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
            </FieldWrapper>

            <FieldWrapper name="person_in_charge" label="Person In Charge" component="Input" />

            <FieldWrapper name="last_action" label="Last Action" component="Input" />
            <FieldWrapper name="service_impact" label="Service Impact" component="Input" />
            <FieldWrapper name="root_cause" label="Root Cause" component="Input" />
            <FieldWrapper name="network_impact" label="Network Impact" component="Input" />
            <FieldWrapper name="recomended_action" label="Recommended Action" component="Textarea" />

            <FieldWrapper name="description" label="Description" component="Textarea" />
        </div>
    );
}

export function CloseTicketFormFields() {
    return (
        <div className="space-y-4">
            <FieldWrapper name="name" label="Full Name" component="Input" readOnly />
            <FieldWrapper name="address" label="Address" component="Input" readOnly />
            <FieldWrapper name="onu_sn" label="ONU SN" component="Input" readOnly />
            <FieldWrapper name="action_close" label="Closing Action" component="Textarea" />
        </div>
    );
}
