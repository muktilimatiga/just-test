import { FieldComponentBoundProps } from "@tanstack/react-form";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormCheckbox } from "@/components/form/FormCheckbox";

declare module "@tanstack/react-form" {
  interface FieldComponentBoundProps<TData, TName, TFieldValidator, TFormValidator> {
    component?: "Input" | "Select" | "Textarea" | "Checkbox";
  }
}