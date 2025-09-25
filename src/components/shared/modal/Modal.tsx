"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useCallback } from "react";

type DynamicModalProps = {
  triggerLabel?: React.ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer_childern?: ReactNode;
  onConfirm?: () => Promise<boolean> | boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  disableCancel?: boolean;
  onClose?: () => void;
  onReset?: () => void;
  BTNCOLOR?: string;
};

export function DynamicModal({
  triggerLabel,
  title,
  description,
  children,
  footer_childern,
  onConfirm,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  disableCancel = false,
  onClose,
  onReset,
  BTNCOLOR = "blue",
}: DynamicModalProps) {
  const [openUncontrolled, setOpenUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : openUncontrolled;

  const setOpen = useCallback(
    (val: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(val);
      } else {
        setOpenUncontrolled(val);
      }
      if (!val) {
        onClose?.();
        onReset?.();
      }
    },
    [isControlled, controlledOnOpenChange, onClose, onReset]
  );

  const handleConfirm = async () => {
    if (!onConfirm) {
      setOpen(false);
      return;
    }
    try {
      const shouldClose = await onConfirm();
      if (shouldClose) setOpen(false);
    } catch (err) {
      console.error("Modal confirm failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button
            className={`bg-${BTNCOLOR}-600 hover:scale-105 cursor-pointer py-5 px-6 text-white hover:bg-${BTNCOLOR}-700`}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="lg:min-w-2xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <hr />

        <div className="py-2 scroll-auto">{children}</div>

        <DialogFooter>
          {!disableCancel && (
            <Button
              variant="ghost"
              className="bg-gray-200 hover:bg-gray-300 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              {cancelLabel}
            </Button>
          )}
          {onConfirm && (
            <Button
              onClick={handleConfirm}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white"
            >
              {confirmLabel}
            </Button>
          )}
          {footer_childern}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
