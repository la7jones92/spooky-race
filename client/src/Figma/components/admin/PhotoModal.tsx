import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  taskTitle: string;
  completedAt?: string;
}

export function PhotoModal({ isOpen, onClose, photoUrl, taskTitle, completedAt }: PhotoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{taskTitle}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {completedAt && (
            <p className="text-sm text-muted-foreground">Submitted at {completedAt}</p>
          )}
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] flex items-center justify-center bg-black/20 rounded-md border border-border">
          <img
            src={photoUrl}
            alt={taskTitle}
            className="max-w-full max-h-[70vh] h-auto object-contain rounded-md"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
