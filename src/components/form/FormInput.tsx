import type { ComponentProps } from "react"
import { Input } from "../ui/input"
import { FormBase, type FormControlProps } from "./FormBase"
import { useFieldContext } from "./hooks"

// 1. Extend FormControlProps with standard Input props
type FormInputProps = FormControlProps & ComponentProps<"input">

export function FormInput({ 
    label, 
    description, 
    disabled, 
    ...props // This contains 'type', 'placeholder', etc.
}: FormInputProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        // 2. Pass layout props to FormBase
        <FormBase 
            label={label} 
            description={description} 
            disabled={disabled}
        >
            <Input
                {...props} // 3. Spread 'type' and others here
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                disabled={disabled} // 4. Ensure input itself is disabled
            />
        </FormBase>
    )
}