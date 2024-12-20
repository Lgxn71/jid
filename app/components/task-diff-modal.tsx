import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Task } from '@prisma/client';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';

interface TaskDiffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  original?: Task;
  modified?: Partial<Task>;
}

export function TaskDiffModal({
  open,
  onOpenChange,
  original,
  modified
}: TaskDiffModalProps) {
  if (!original || !modified) return null;

  const differences = Object.entries(modified).filter(
    ([key, value]) => original[key as keyof Task] !== value
  );

  const handleApplyChanges = async () => {
    await fetch(`/api/task/${original.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modified)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proposed Task Changes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {differences.map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{key}</p>
                <p className="text-red-500 line-through">
                  {original[key as keyof Task]?.toString() || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">New Value</p>
                <p className="text-green-500">{value?.toString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleApplyChanges}>
            <Check className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 