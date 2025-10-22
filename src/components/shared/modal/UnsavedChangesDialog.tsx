"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  discardLabel?: string;
  cancelLabel?: string;
}

export function UnsavedChangesDialog({
  open,
  onConfirm,
  onDiscard,
  onCancel,
  title = "Modifications non enregistrées",
  description =
    "Vous avez des modifications non enregistrées sur ce ticket. Souhaitez-vous les enregistrer avant de fermer ?",
  confirmLabel = "Enregistrer et fermer",
  discardLabel = "Ignorer les modifications",
  cancelLabel = "Continuer l'édition",
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(state) => !state && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="min-w-2xl w-[92vw] sm:w-[30rem] rounded-2xl px-6 py-5 space-y-5"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onDiscard}
            className="w-full sm:w-auto"
          >
            {discardLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
