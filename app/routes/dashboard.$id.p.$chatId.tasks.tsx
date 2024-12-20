import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider
} from '~/components/roadmap-ui/kanban';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { format, isValid, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClientOnly } from 'remix-utils/client-only';
import { z } from 'zod';
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  useParams,
  useSubmit,
  useSearchParams
} from '@remix-run/react';
import { getShapeStream, preloadShape, useShape } from '@electric-sql/react';
import { Status, Task, User } from '@prisma/client';
import { matchStream } from '~/lib/match-stream';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { authenticator, isLoggedIn } from './auth+/server';
import {
  useQuery,
  useQueryClient,
  useMutation,
  useMutationState
} from '@tanstack/react-query';
import { Badge } from '~/components/ui/badge';
import { prisma } from '~/db.server';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, ListPlusIcon } from 'lucide-react';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { TaskModal } from '~/components/task-modal';

const textSchema = z.object({
  description: z.string().min(1),
  createdAt: z.number().default(Date.now()),
  uuid: z
    .string()
    .uuid()
    .default(() => uuidv4())
});

const taskShape = (params: Record<string, string | undefined>) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"Task"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY['${params.chatId}']::text[]`
    }
  };
};

const statusShape = (params: Record<string, string | undefined>) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"Status"',
      where: `ARRAY["projectId"]::text[] <@ ARRAY['${params.chatId}']::text[]`
    }
  };
};

const userTaskShape = (userIds: string[]) => {
  return {
    url: new URL(`/api/shape-proxy`, window.location.origin).href,
    params: {
      table: '"_UserTasks"',
      where: `ARRAY["B"]::text[] <@ ARRAY['${userIds}']::text[]`
    }
  };
};

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  statusId: z.string({ required_error: 'Status is required' }),
  assigneeIds: z.array(z.string()).optional().default([]),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  startAt: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable()
});

const createStatusSchema = z.object({
  status: z.string().min(1, 'Status name is required')
});

const updateTaskSchema = z.object({
  taskId: z.string(),
  statusId: z.string()
});

type CreateStatusFormValues = z.infer<typeof createStatusSchema>;

const CreateStatusDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const params = useParams();

  const form = useForm<CreateStatusFormValues>({
    resolver: zodResolver(createStatusSchema),
    defaultValues: {
      status: ''
    }
  });

  const onSubmit = async (data: CreateStatusFormValues) => {
    try {
      const response = await fetch(
        `/dashboard/${params.id}/p/${params.chatId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            intent: 'CREATE_STATUS',
            ...data
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create status');
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating status:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListPlusIcon className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Status</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter status name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Create Status</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await isLoggedIn(request);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw new Error('Unauthenticated!');
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!params.chatId) {
    return json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    let rawData;
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = Object.fromEntries(formData);
    }

    if (rawData.intent === 'UPDATE_TASK_STATUS') {
      const data = updateTaskSchema.parse({
        taskId: rawData.taskId,
        statusId: rawData.statusId
      });

      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: params.chatId,
          members: {
            some: {
              id: user.id
            }
          }
        }
      });

      if (!project) {
        return json(
          { error: 'You do not have access to this project' },
          { status: 403 }
        );
      }

      // Verify status belongs to the project
      const status = await prisma.status.findFirst({
        where: {
          id: data.statusId,
          projectId: params.chatId
        }
      });

      if (!status) {
        return json(
          { error: 'Invalid status for this project' },
          { status: 400 }
        );
      }

      // Update the task status
      const task = await prisma.task.update({
        where: { id: data.taskId },
        data: { statusId: data.statusId },
        include: {
          assignees: true,
          status: true
        }
      });

      return json({ task });
    }

    // Handle status creation
    if (rawData.intent === 'CREATE_STATUS') {
      const data = createStatusSchema.parse(rawData);

      // Verify user has access to the project
      const project = await prisma.project.findFirst({
        where: {
          id: params.chatId,
          members: {
            some: {
              id: user.id
            }
          }
        }
      });

      if (!project) {
        return json(
          { error: 'You do not have access to this project' },
          { status: 403 }
        );
      }

      // Check if status already exists
      const existingStatus = await prisma.status.findFirst({
        where: {
          projectId: params.chatId,
          status: data.status
        }
      });

      if (existingStatus) {
        return json(
          { error: 'A status with this name already exists' },
          { status: 400 }
        );
      }

      // Create the status
      const status = await prisma.status.create({
        data: {
          status: data.status,
          projectId: params.chatId
        }
      });

      return json({ status });
    }

    // Handle task creation (existing code)
    const data = createTaskSchema.parse(rawData);

    // Verify user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: params.chatId,
        members: {
          some: {
            id: user.id
          }
        }
      }
    });

    if (!project) {
      return json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Verify status belongs to the project
    const status = await prisma.status.findFirst({
      where: {
        id: data.statusId,
        projectId: params.chatId
      }
    });

    if (!status) {
      return json(
        { error: 'Invalid status for this project' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        projectId: params.chatId,
        statusId: data.statusId,
        priority: data.priority,
        startAt: data.startAt,
        dueDate: data.dueDate,
        assignees: data.assigneeIds
          ? {
              connect: data.assigneeIds.map(id => ({ id }))
            }
          : undefined
      },
      include: {
        assignees: true,
        status: true
      }
    });

    return json({ task });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      return json(
        { error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return json({ error: 'Operation failed' }, { status: 500 });
  }
};

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
  return await preloadShape(taskShape(params));
};

const createTaskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  statusId: z.string({ required_error: 'Status is required' }),
  assigneeIds: z.array(z.string()).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  startAt: z.string().optional(),
  dueDate: z.string().optional()
});

type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

const CreateTaskDialog: FC<{ statuses: Status[]; users: any[] }> = ({
  statuses,
  users
}) => {
  const [open, setOpen] = useState(false);
  const params = useParams();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'Medium',
      assigneeIds: []
    }
  });

  const onSubmit = async (data: z.infer<typeof createTaskSchema>) => {
    try {
      const formattedData = {
        ...data,
        startAt: data.startAt ? new Date(data.startAt).toISOString() : null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assigneeIds: data.assigneeIds || []
      };

      const response = await fetch(
        `/dashboard/${params.id}/p/${params.chatId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Task name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignees</FormLabel>
                  <Select
                    value={field.value?.join(',') || ''}
                    onValueChange={(value) => {
                      field.onChange(value ? value.split(',').filter(Boolean) : []);
                    }}
                    multiple
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.user.id} value={user.user.id}>
                          {user.user.firstName} {user.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

type TaskUpdate = {
  taskId: string;
  statusId: string;
};

async function updateTaskStatus({ taskId, statusId }: TaskUpdate) {
  const taskStream = getShapeStream<Pick<Task, 'id'>>(
    taskShape({
      chatId: window.location.pathname.split('/')[4]
    })
  );

  // Match the update
  const findUpdatePromise = matchStream({
    stream: taskStream,
    operations: ['update'],
    matchFn: ({ message }) => message.value.id === taskId
  });

  // Update task
  const formData = new FormData();
  formData.append('intent', 'UPDATE_TASK_STATUS');
  formData.append('taskId', taskId);
  formData.append('statusId', statusId);

  const fetchPromise = fetch(
    `/dashboard/${window.location.pathname.split('/')[2]}/p/${
      window.location.pathname.split('/')[4]
    }/tasks`,
    {
      method: 'POST',
      body: formData
    }
  );

  return await Promise.all([findUpdatePromise, fetchPromise]);
}

export const KanbanExample: FC = () => {
  const queryClient = useQueryClient();
  const submit = useSubmit();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: users } = useQuery<
    {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string | null;
        imageUrl: string | null;
      };
      role: string;
    }[]
  >({
    queryKey: [`org_${params.id}_users`]
  });
  const { data: tasks } = useShape(taskShape(params)) as { data: Task[] };
  const { data: statuses } = useShape(statusShape(params)) as {
    data: Status[];
  };

  const { data: userTasks } = useShape(
    userTaskShape(users?.map(user => user.user.id) ?? [])
  ) as {
    data: { A: string; B: string }[];
  };

  const submissions = useMutationState({
    filters: { status: 'pending' },
    select: mutation => mutation.state.context as Task
  }).filter(task => task !== undefined);

  const [activeDragTask, setActiveDragTask] = useState<{
    taskId: string;
    statusId: string;
  } | null>(null);

  const { mutate: updateTaskStatusMut } = useMutation({
    mutationKey: ['update-task-status'],
    mutationFn: updateTaskStatus,
    onMutate: async newTask => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['tasks', params.chatId]
      });

      // Get the current task from the shape data
      const currentTask = tasks.find(task => task.id === newTask.taskId);
      if (!currentTask) return;

      // Create optimistic task
      const optimisticTask: Task = {
        ...currentTask,
        statusId: newTask.statusId
      };

      // Add to mutation state for optimistic UI
      return optimisticTask;
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const status = statuses.find(status => status.status === over.id);
    if (!status) {
      return;
    }

    const taskId = active.id as string;
    const statusId = status.id;

    try {
      updateTaskStatusMut({ taskId, statusId });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Merge data from shape & optimistic data from mutations
  const tasksMap = new Map<string, Task>();

  // Add all tasks from ElectricSQL shape
  tasks.forEach(task => {
    tasksMap.set(task.id, task);
  });

  // Merge in any optimistic updates from pending mutations
  submissions.forEach(task => {
    if (task && tasksMap.has(task.id)) {
      tasksMap.set(task.id, { ...tasksMap.get(task.id)!, ...task });
    }
  });

  const mergedFeatures = useMemo(() => {
    return [...tasksMap.values()].map(task => {
      const status = statuses.find(status => status.id === task.statusId);
      const assignees = userTasks
        .filter(userTask => userTask.A === task.id)
        .reduce(
          (acc, userTask) => {
            const user = users?.find(user => user.user.id === userTask.B);
            if (user) acc.push(user);
            return acc;
          },
          [] as {
            user: {
              id: string;
              email: string;
              firstName: string;
              lastName: string | null;
              imageUrl: string | null;
            };
            role: string;
          }[]
        );

      return {
        ...task,
        status,
        assignees
      };
    });
  }, [tasksMap, users, userTasks, statuses]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return <em>Not set</em>;
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(dateObj)) return <em>Invalid date</em>;
      return format(dateObj, 'MMM d');
    } catch (error) {
      console.error('Error formatting date:', error);
      return <em>Invalid date</em>;
    }
  };

  console.log(mergedFeatures);

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4 gap-2">
        <CreateStatusDialog />
        <CreateTaskDialog statuses={statuses} users={users ?? []} />
      </div>
      <KanbanProvider onDragEnd={handleDragEnd}>
        {statuses.map(status => (
          <KanbanBoard key={status.status} id={status.status}>
            <KanbanHeader name={status.status} color={'green'} />
            <KanbanCards>
              {mergedFeatures
                .filter(feature => feature?.status?.status === status.status)
                .map((feature, index) => (
                  <KanbanCard
                    key={feature.id}
                    id={feature.id}
                    name={feature.name}
                    parent={status.status}
                    index={index}
                    onClick={() => setSearchParams({ t: feature.id })}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {feature.name}
                        </p>
                        <p className="m-0 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                          {feature.description ?? <em>Empty Description</em>}
                        </p>
                      </div>
                      {feature.assignees[0] && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage
                            src={feature.assignees[0].user.imageUrl ?? ''}
                          />
                          <AvatarFallback>
                            {feature.assignees[0].user.firstName?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="m-0 text-xs text-muted-foreground mt-2">
                      {formatDate(feature.startAt)} -{' '}
                      {formatDate(feature.dueDate)}
                    </p>
                    <Badge className="mt-2 text-xs">
                      Priority: {feature.priority}
                    </Badge>
                  </KanbanCard>
                ))}
            </KanbanCards>
          </KanbanBoard>
        ))}
      </KanbanProvider>
      
      <TaskModal statuses={statuses} users={users} />
    </div>
  );
};

export default function KanbanPage() {
  return <ClientOnly>{() => <KanbanExample />}</ClientOnly>;
}
