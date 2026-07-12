"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { detectRecipientType } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  onResolved?: (address: string | null) => void;
  disabled?: boolean;
}

export function RecipientInput({
  value,
  onChange,
  onResolved,
  disabled,
}: RecipientInputProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipientType = value ? detectRecipientType(value) : null;

  const getIcon = () => {
    if (isResolving) return <Loader2 className="h-5 w-5 animate-spin text-droplet-500" />;
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (resolved) return <CheckCircle2 className="h-5 w-5 text-green-500" />;

    switch (recipientType) {
      case "email":
        return <Mail className="h-5 w-5 text-muted-foreground" />;
      case "phone":
        return <Phone className="h-5 w-5 text-muted-foreground" />;
      case "address":
        return <Wallet className="h-5 w-5 text-muted-foreground" />;
      case "sui":
        return <User className="h-5 w-5 text-muted-foreground" />;
      default:
        return <User className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPlaceholder = () => {
    return "Send to — .sui name, email, or phone";
  };

  const getHelperText = () => {
    if (error) return error;
    if (resolved) return `Resolved ✓`;
    switch (recipientType) {
      case "email":
        return "Email address detected";
      case "phone":
        return "Phone number detected";
      case "address":
        return "Sui address detected";
      case "sui":
        return ".sui name detected";
      default:
        return null;
    }
  };

  const helperText = getHelperText();

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {getIcon()}
        </div>
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setResolved(false);
            setError(null);
          }}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={cn(
            "pl-10 pr-4 h-12 text-base",
            error && "border-red-500 focus-visible:ring-red-500",
            resolved && "border-green-500 focus-visible:ring-green-500"
          )}
        />
      </div>
      {helperText && (
        <p
          className={cn(
            "text-xs px-1",
            error ? "text-red-500" : "text-muted-foreground"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
