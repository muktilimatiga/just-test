import type { ComponentProps } from "react"
import { Input } from "../ui/input"
import { FormBase, type FormControlProps } from "./FormBase"

// 1. Add 'field' to the type definition
// We use 'any' for the field to prevent complex generic type errors, 
// but strictly speaking it should be 'FieldApi<...>'
type FormInputProps = FormControlProps & ComponentProps<"input"> & {
    field: any
}

export function FormInput({
    label,
    name, // We don't use this anymore, we use field.name
    field, // 👈 Destructure the new field prop
    description,
    disabled,
    ...props
}: FormInputProps) {

    const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;

    return (
        <FormBase
            label={label}
            description={description}
            disabled={disabled}
            field={field}

        >
            <Input
                {...props}
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                disabled={disabled}
                className={props.className} // Ensure className is passed
            />
        </FormBase>
    )
}