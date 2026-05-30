"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  deletePaymentMethodAction,
  togglePaymentMethodAction
} from "@/app/admin/actions";
import type { AdminPaymentMethod } from "@/lib/admin/data";
import PaymentMethodForm from "./PaymentMethodForm";

export default function PaymentMethodRowActions({
  method
}: {
  method: AdminPaymentMethod;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const onToggle = () => {
    startTransition(async () => {
      const res = await togglePaymentMethodAction(method.id, !method.is_active);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(method.is_active ? "Hidden" : "Shown");
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (
      !confirm(
        `"${method.label}" delete korte chan? Existing orders ei method-er reference rakhbe — eta permanent.`
      )
    )
      return;
    startTransition(async () => {
      const res = await deletePaymentMethodAction(method.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Deleted");
        router.refresh();
      }
    });
  };

  if (editing) {
    return (
      <div className="w-full mt-2">
        <PaymentMethodForm
          method={method}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => setEditing(true)}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border border-mango-200 hover:bg-mango-50"
        aria-label="Edit"
      >
        <Edit className="h-3.5 w-3.5 text-mango-700" />
      </button>
      <button
        onClick={onToggle}
        disabled={pending}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border border-mango-200 hover:bg-mango-50 disabled:opacity-50"
        aria-label={method.is_active ? "Hide" : "Show"}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : method.is_active ? (
          <EyeOff className="h-3.5 w-3.5 text-ink" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-leaf-600" />
        )}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="grid place-items-center h-8 w-8 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 disabled:opacity-50"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      </button>
    </div>
  );
}
