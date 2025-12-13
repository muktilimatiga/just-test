import { useFieldContext } from "./hooks"
import { FormBase, type FormControlProps } from "./FormBase"
import type { ReactNode } from "react"
import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select"

// Add 'items' to the props definition
export function FormSelect({
    children,
    items, // <--- 1. Destructure 'items' here
    ...props
}: FormControlProps & { children?: ReactNode; items?: ReactNode }) { // Type is optional
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        // 'items' is removed from 'props' so it won't be passed to FormBase
        <FormBase {...props}>
            <Select
                onValueChange={e => field.handleChange(e)}
                value={field.state.value}
            >
                <SelectTrigger
                    aria-invalid={isInvalid}
                    id={field.name}
                    onBlur={field.handleBlur}
                >
                    <SelectValue />
                </SelectTrigger>

                {/* 2. Render children OR items inside the Content */}
                <SelectContent>
                    {children || items}
                </SelectContent>
            </Select>
        </FormBase>
    )
}