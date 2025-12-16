
import { FieldWrapper } from './FieldWrapper';
import { z } from 'zod';


export const DefaultFormSchema = z.object({
    name: z.string(),
    address: z.string(),
    description: z.string(),
    PIC: z.string(),
})

export const TicketFormSchema = DefaultFormSchema.extend({
    interface: z.string(),
    onu_sn: z.string(),
})

export const CreateTicketFormSchema = DefaultFormSchema.extend({
    olt_name: z.string(),
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
    PIC: true,
}).extend({
    action_close: z.string(),
})

export type DefaultFormData = z.infer<typeof DefaultFormSchema>;
export type CreateFormTicketData = z.infer<typeof CreateTicketFormSchema>;
export type OpenFormTicketData = z.infer<typeof OpenTicketFormSchema>;
export type ForwardFormTicketData = z.infer<typeof ForwardTicketFormSchema>;
export type CloseFormTicketData = z.infer<typeof CloseTicketFormSchema>;


export function CreateTicketFormFields() {
    return (
        <div className="form-content">
            <FieldWrapper name="name" label="Customer Name" component="Input" />
            <FieldWrapper name="address" label="Customer Address" component="Input" />

            <div className="form-content-grid-2">
                <FieldWrapper name="olt_name" label="OLT Name" component="Input" />
                <FieldWrapper name="user_pppoe" label="User PPPOE" component="Input" />
            </div>

            <div className="form-content-grid-3">
                <FieldWrapper name="ticketRef" label="Reference" component="Input" readOnly />

                <FieldWrapper
                    name="priority"
                    label="Priority"
                    component="Select"
                    items={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' },
                        { value: 'Critical', label: 'Critical' },
                    ]}
                />

                <FieldWrapper
                    name="type"
                    label="Type"
                    component="Select"
                    items={[
                        { value: 'FREE', label: 'Free' },
                        { value: 'CHARGED', label: 'Charged' },
                    ]}
                />
            </div>

            <FieldWrapper
                name="description"
                label="Problem Description"
                component="Textarea"
                rows={4}
            />
            <FieldWrapper name="PIC" label="PIC" component="Input" readOnly />
        </div>
    );
}

export function OpenTicketFormFields() {
    return (
        <div className="form-content">
            <FieldWrapper name="name" label="Full Name" component="Input" />
            <FieldWrapper name="address" label="Address" component="Input" />
            <div className="form-content-grid-2">
                <FieldWrapper name="olt_name" label="OLT Name" component="Input" />
                <FieldWrapper name="interface" label="Interface" component="Input" />
            </div>
            <FieldWrapper name="action_ticket" label="Action Ticket" component="Input" />
            <FieldWrapper name="description" label="Description" component="Textarea" />
        </div>
    );
}

export function ForwardTicketFormFields() {
    return (
        <div className="form-content">
            <FieldWrapper name="name" label="Customer Name" component="Input" />
            <FieldWrapper name="address" label="Alamat" component="Input" />
            <div className="form-content-grid-2">
                <FieldWrapper name="description" label="Description" component="Input" readOnly />
                <FieldWrapper name="last_action" label="Last Action" component="Input" readOnly />
            </div>
            <FieldWrapper name="service_impact" label="Service Impact" component="Input" />
            <div className="form-content-grid-2">
                <FieldWrapper name="root_cause" label="Root Cause" component="Input" />
                <FieldWrapper name="network_impact" label="Network Impact" component="Input" />
            </div>
            <div className="form-content-grid-2">
                <FieldWrapper name="interface" label="Interface" component="Input" />
                <FieldWrapper name="onu_sn" label="ONU SN" component="Input" />
            </div>
            <div className="form-content-grid-2">
                <FieldWrapper
                    name="priority"
                    label="Priority"
                    component="Select"
                    items={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' },
                        { value: 'Critical', label: 'Critical' },
                    ]}
                />
                <FieldWrapper name="person_in_charge" label="Person In Charge" component="Input" readOnly />
            </div>
            <FieldWrapper name="recomended_action" label="Recommended Action" component="Textarea" />
        </div>
    );
}

export function CloseTicketFormFields() {
    return (
        <div className="form-content">
            <FieldWrapper name="name" label="Full Name" component="Input" readOnly />
            <FieldWrapper name="address" label="Address" component="Input" readOnly />
            <div className="form-content-grid-2">
                <FieldWrapper name="olt_name" label="OLT Name" component="Input" readOnly />
                <FieldWrapper name="onu_sn" label="ONU SN" component="Input" readOnly />
            </div>
            <FieldWrapper name="action_close" label="Closing Action" component="Textarea" />
            <FieldWrapper name="PIC" label="PIC" component="Input" readOnly />
        </div>

    );
}
