import { useNavigate, useSearchParams } from '@remix-run/react';
import { Task, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface TaskCardProps {
  task: Task & {
    assignees: User[];
    status: { name: string; color: string };
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleClick = () => {
    // Preserve existing search params and add/update 't' parameter
    const newParams = new URLSearchParams(searchParams);
    newParams.set('t', task.id);
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="font-medium mb-2">{task.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {task.assignees.map(assignee => (
            <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white">
              <AvatarImage src={assignee.imageUrl ?? ''} />
              <AvatarFallback>
                {assignee.firstName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Badge 
          variant="secondary"
          style={{ 
            backgroundColor: task.status.color + '20',
            color: task.status.color 
          }}
        >
          {task.status.name}
        </Badge>
      </div>
    </div>
  );
} 