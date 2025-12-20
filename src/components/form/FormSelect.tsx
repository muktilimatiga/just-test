
import { FormBase, type FormControlProps } from "./FormBase"
import type { ReactNode } from "react"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "../ui/select"

export function FormSelect({
    children,
    items,
    className, // 1. Destructure className
    onChange,  // 2. Destructure onChange
    field,
    placeholder,
    ...props
}: FormControlProps & {
    children?: ReactNode,
    items?: { value: string, label: string }[],
    className?: string,                  // 3. Add Type Definition
    onChange?: (value: string) => void   // 4. Add Type Definition
    field: any
    placeholder?: string
}) {
    // 1. Remove context logic as it throws
    // const contextField = useFieldContext<string>()
    // const field = props.field || contextField

    // We assume field is passed.
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <FormBase {...props} field={field}>
            <Select
                // 5. Chain the custom onChange with the field's handler
                onValueChange={e => {
                    field.handleChange(e);
                    if (onChange) onChange(e);
                }}
                value={field.state.value}
            >
                <SelectTrigger
                    // 6. Pass className here to style the input box
                    className={className}
                    aria-invalid={isInvalid}
                    name={field.name}
                    onBlur={field.handleBlur}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {children}
                    {items?.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormBase>
    )
}