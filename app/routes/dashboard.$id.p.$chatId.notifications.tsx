import { Outlet, useSearchParams } from '@remix-run/react';
import { TaskSheet } from '~/components/task-sheet';

export default function ProjectLayout() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('t');

  return (
    <>
      <Outlet />
      {taskId && <TaskSheet taskId={taskId} />}
    </>
  );
} 