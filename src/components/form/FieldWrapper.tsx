import { Field } from "@tanstack/react-form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormTextarea } from "./FormTextarea";
import { FormCheckbox } from "./FormCheckbox";
import { useFormContext } from "./hooks";

type FieldWrapperProps = {
  name: string;
  label: string;
  component: "Input" | "Select" | "Textarea" | "Checkbox";
  validators?: any;
  children?: React.ReactNode;
  [key: string]: any;
};

const componentMap = {
  Input: FormInput,
  Select: FormSelect,
  Textarea: FormTextarea,
  Checkbox: FormCheckbox,
};

export function FieldWrapper({
  name,
  component,
  validators,
  children,
  ...props
}: FieldWrapperProps) {
  const Component = componentMap[component];
  const form = useFormContext() as any;

  const allowChildren = component === "Select";

  return (
    <Field name={name} validators={validators} form={form}>
      {(field) => (
        <Component
          {...props}
          value={field.state.value as any}
          onChange={
            component === "Select"
              ? field.handleChange
              : (e: any) => field.handleChange(e.target.value)
          }
          onBlur={field.handleBlur}
          id={field.name}
          field={field}
        >
          {allowChildren ? children : null}
        </Component>
      )}
    </Field>
  );
}
