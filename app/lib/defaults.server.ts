import { prisma } from '~/db.server';

export async function createDefaultStatuses(projectId: string) {
  const defaultStatuses = ['Planned', 'In Progress', 'Done'];
  
  await prisma.status.createMany({
    data: defaultStatuses.map(status => ({
      status,
      projectId
    }))
  });
} 