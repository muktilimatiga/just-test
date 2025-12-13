import { Textarea } from "../ui/textarea"
import { FormBase, type FormControlProps } from "./FormBase"


import type { ComponentProps } from "react"
// ...
// ...
export function FormTextarea({
    label,
    description,
    disabled,
    field,
    ...props // These should be textarea props
}: FormControlProps & ComponentProps<"textarea"> & { field: any }) {
    // 1. Remove useFieldContext
    // const contextField = useFieldContext<string>() 
    // const field = propField || contextField

    // We assume field is passed.
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FormBase label={label} description={description} disabled={disabled} field={field}>
            <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                {...props} // Spread rest props (rows, className) here
            />
        </FormBase>
    )
}