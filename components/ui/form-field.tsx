"use client";

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputProps {
  label: string;
  error?: boolean;
  errorMessage?: string;
  description?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, errorMessage, description, className, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className={cn(error && "text-destructive")}
        >
          {label}
        </Label>
        <Input
          id={inputId}
          ref={ref}
          error={error}
          errorMessage={errorMessage}
          className={className}
          {...props}
        />
        {description && !error && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";