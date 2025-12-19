import { Field } from "@tanstack/react-form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormTextarea } from "./FormTextarea";
import { FormCheckbox } from "./FormCheckbox";
import { useFormContext } from "./hooks";
import React from "react";

const componentMap = {
  Input: FormInput,
  Select: FormSelect,
  Textarea: FormTextarea,
  Checkbox: FormCheckbox,
} as const;

type ComponentType = keyof typeof componentMap;

type FieldWrapperProps = {
  name: string;
  component: ComponentType;
  label?: string;
  validators?: any;
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
  rows?: number;
  items?: { value: string; label: string }[];
  onChange?: (value: any) => void;
};

export function FieldWrapper({
  name,
  component,
  validators,
  children,
  className,
  placeholder,
  onChange,
  ...props
}: FieldWrapperProps) {
  const form = useFormContext() as any;

  return (
    <Field name={name} validators={validators} form={form}>
      {(field) => {
        if (component === "Checkbox") {
          return (
            <FormCheckbox
              {...props}
              field={field}
            />
          );
        }

        const Component = componentMap[component];

        return (
          <Component
            {...props}
            className={className}
            placeholder={placeholder}
            id={field.name}
            field={field}
            value={String(field.state.value ?? "")}
            onChange={(value: any) => {
              if (component === "Select") {
                field.handleChange(value);
              } else {
                field.handleChange(value.target.value);
              }
              onChange?.(value);
            }}
            onBlur={field.handleBlur}
          >
            {component === "Select" ? children : null}
          </Component>
        );
      }}
    </Field>
  );
}
