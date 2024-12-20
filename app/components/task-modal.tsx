import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { Task, User, Status } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from './ui/button';
import { useDebounce } from '~/hooks/use-debounce';

interface TaskModalProps {
  statuses: Status[];
  users: User[];
}

export function TaskModal({ statuses, users }: TaskModalProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('t');
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce task updates to prevent too many API calls
  const debouncedTask = useDebounce(task, 500);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // Update task in database when debounced task changes
  useEffect(() => {
    if (debouncedTask) {
      updateTask(debouncedTask);
    }
  }, [debouncedTask]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/task/${taskId}`);
      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (updatedTask: Partial<Task>) => {
    try {
      await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('t');
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  if (!task || loading) {
    return null;
  }

  return (
    <Dialog open={!!taskId} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={task.name}
              onChange={e => setTask({ ...task, name: e.target.value })}
              className="text-xl font-bold"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Textarea
              value={task.description || ''}
              onChange={e => setTask({ ...task, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Status
              </label>
              <Select
                value={task.statusId}
                onValueChange={value => 
                  setTask({ ...task, statusId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Assignees
              </label>
              <Select
                value={task.assigneeIds?.join(',')}
                onValueChange={value => 
                  setTask({ 
                    ...task, 
                    assigneeIds: value.split(',').filter(Boolean)
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 