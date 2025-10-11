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
        <div className="mt-4">
          <img
            src={photoUrl}
            alt={taskTitle}
            className="w-full h-auto rounded-md border border-border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
