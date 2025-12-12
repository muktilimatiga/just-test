import type { ReactNode } from "react"
import { useFieldContext } from "./hooks"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel
} from "@/components/ui/field"

// 1. Add 'disabled' to the shared props
export type FormControlProps = {
    label: string
    description?: string
    disabled?: boolean 
}

type FormBaseProps = FormControlProps & {
    children: ReactNode
    horizontal?: boolean
    controlFirst?: boolean
}

export function FormBase({
    children,
    label,
    description,
    controlFirst,
    horizontal,
    disabled, // 2. Destructure disabled
}: FormBaseProps) {
    const field = useFieldContext()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    
    const labelElement = (
        <>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
        </>
    )
    const errorElem = isInvalid && <FieldError errors={field.state.meta.errors} />

    return (
        <Field
            data-invalid={isInvalid}
            // 3. Pass disabled state to the wrapper for global styling (e.g. opacity)
            aria-disabled={disabled} 
            orientation={horizontal ? "horizontal" : undefined}
        >
            {controlFirst ? (
                <>
                    {children}
                    <FieldContent>
                        {labelElement}
                        {errorElem}
                    </FieldContent>
                </>
            ) : (
                <>
                    <FieldContent>{labelElement}</FieldContent>
                    {children}
                    {errorElem}
                </>
            )}
        </Field>
    )
}