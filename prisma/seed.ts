import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      id: 'usr_abcd12',
      email: 'founder@fusiontech.com',
      authProvider: 'email',
      firstName: 'Alex',
      lastName: 'Johnson',
      isOnboarded: true
    }
  });

  const organization = await prisma.organization.create({
    data: {
      id: 'org_fusion1',
      name: 'FusionTech Solutions',
      description:
        'A cutting-edge tech startup focused on next-generation solutions.',
      ownerId: user.id
    }
  });

  const project = await prisma.project.create({
    data: {
      id: 'proj_nextgen1',
      name: 'NextGen MVP',
      description: 'The flagship MVP product to disrupt the market.',
      organizationId: organization.id
    }
  });

  const backlogStatus = await prisma.status.create({
    data: {
      id: 'status_backlog',
      status: 'Backlog',
      projectId: project.id
    }
  });

  const inProgressStatus = await prisma.status.create({
    data: {
      id: 'status_inprogress',
      status: 'In Progress',
      projectId: project.id
    }
  });

  const reviewStatus = await prisma.status.create({
    data: {
      id: 'status_review',
      status: 'Review',
      projectId: project.id
    }
  });

  const doneStatus = await prisma.status.create({
    data: {
      id: 'status_done',
      status: 'Done',
      projectId: project.id
    }
  });

  // Current date reference
  const now = new Date();

  // Helper function to assign date fields based on status
  function getDatesForStatus(statusId: string) {
    if (statusId === backlogStatus.id) {
      return {
        startAt: null,
        endAt: null,
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
      };
    } else if (statusId === inProgressStatus.id) {
      return {
        startAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // started 1 week ago
        endAt: null,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // due in 1 week
      };
    } else if (statusId === reviewStatus.id) {
      return {
        startAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // started 3 weeks ago
        endAt: null,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // due in 3 days
      };
    } else if (statusId === doneStatus.id) {
      return {
        startAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // started 1 month ago
        endAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // ended yesterday
        dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) // was due 2 weeks ago
      };
    } else {
      // Default fallback
      return { startAt: null, endAt: null, dueDate: null };
    }
  }

  const tasksData = [
    {
      name: 'Conduct initial market research',
      description: 'Identify target audience...',
      statusId: backlogStatus.id
    },
    {
      name: 'Define MVP feature set',
      description: 'List core features...',
      statusId: backlogStatus.id
    },
    {
      name: 'Create user personas',
      description: 'Develop detailed user personas...',
      statusId: backlogStatus.id
    },
    {
      name: 'Wireframe initial UI/UX',
      description: 'Sketch user flows...',
      statusId: backlogStatus.id
    },
    {
      name: 'Set up development environment',
      description: 'Configure repo...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Design system architecture',
      description: 'Plan out backend...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Implement authentication system',
      description: 'Set up user login...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Develop initial frontend components',
      description: 'Create basic React components...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Integrate UI with mock API',
      description: 'Connect frontend to mocked backend...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Implement database schema',
      description: 'Create necessary tables...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Set up basic logging & monitoring',
      description: 'Add logs, error tracking...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Implement user profile management',
      description: 'Allow users to update profile...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Implement password reset flow',
      description: 'Email-based password reset...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Develop feature: Real-time notifications',
      description: 'Push notifications...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Build settings page UI',
      description: 'UI for user settings...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Create integration tests for auth',
      description: 'Verify login, registration...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Optimize frontend performance',
      description: 'Lazy load, memoize...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Implement responsive design',
      description: 'Ensure UI works on mobile...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Set up feature flag system',
      description: 'Enable incremental feature rollout...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Create onboarding tutorial',
      description: 'Guided steps for first-time users...',
      statusId: inProgressStatus.id
    },
    {
      name: 'Integrate payment gateway',
      description: 'Support for Stripe...',
      statusId: reviewStatus.id
    },
    {
      name: 'Implement search functionality',
      description: 'Search across content...',
      statusId: reviewStatus.id
    },
    {
      name: 'Add analytics tracking',
      description: 'Track user engagement...',
      statusId: reviewStatus.id
    },
    {
      name: 'Prepare documentation website',
      description: 'Write initial docs...',
      statusId: reviewStatus.id
    },
    {
      name: 'User acceptance testing (UAT)',
      description: 'Gather feedback from beta testers...',
      statusId: reviewStatus.id
    },
    {
      name: 'Refactor codebase for maintainability',
      description: 'Clean up code...',
      statusId: reviewStatus.id
    },
    {
      name: 'Security audit & pentesting',
      description: 'Identify security vulnerabilities...',
      statusId: reviewStatus.id
    },
    {
      name: 'Implement caching strategy',
      description: 'Improve performance by caching...',
      statusId: reviewStatus.id
    },
    {
      name: 'Improve error handling UX',
      description: 'Show user-friendly errors...',
      statusId: reviewStatus.id
    },
    {
      name: 'Staging environment deployment',
      description: 'Deploy MVP to staging...',
      statusId: reviewStatus.id
    },
    {
      name: 'Internationalization (i18n) setup',
      description: 'Enable translations...',
      statusId: reviewStatus.id
    },
    {
      name: 'Accessibility audit',
      description: 'Ensure WCAG compliance...',
      statusId: reviewStatus.id
    },
    {
      name: 'Load testing & scalability checks',
      description: 'Test system under load...',
      statusId: reviewStatus.id
    },
    {
      name: 'Email verification setup',
      description: 'Validate user emails...',
      statusId: reviewStatus.id
    },
    {
      name: 'Add multi-factor authentication',
      description: 'Enhance security with MFA...',
      statusId: reviewStatus.id
    },
    {
      name: 'Refine UI copy and microcopy',
      description: 'Polish wording...',
      statusId: reviewStatus.id
    },
    {
      name: 'Implement dark mode theme',
      description: 'Offer dark mode UI...',
      statusId: reviewStatus.id
    },
    {
      name: 'Verify API versioning strategy',
      description: 'Ensure backward-compatible API changes...',
      statusId: reviewStatus.id
    },
    {
      name: 'Add support for custom user avatars',
      description: 'Allow users to choose avatars...',
      statusId: reviewStatus.id
    },
    {
      name: 'Push final production build',
      description: 'Deploy final MVP...',
      statusId: doneStatus.id
    },
    {
      name: 'Announce product launch on social media',
      description: 'Prepare launch posts...',
      statusId: doneStatus.id
    },
    {
      name: 'Set up customer support channels',
      description: 'Create help center...',
      statusId: doneStatus.id
    },
    {
      name: 'Measure initial user onboarding metrics',
      description: 'Track new user engagement...',
      statusId: doneStatus.id
    },
    {
      name: 'Collect NPS score from early adopters',
      description: 'Survey users for NPS...',
      statusId: doneStatus.id
    },
    {
      name: 'Plan Phase 2 roadmap',
      description: 'Outline future features...',
      statusId: doneStatus.id
    },
    {
      name: 'Optimize SEO settings',
      description: 'Improve search engine visibility...',
      statusId: doneStatus.id
    },
    {
      name: 'Settle legal & compliance checks',
      description: 'Ensure legal standards met...',
      statusId: doneStatus.id
    },
    {
      name: 'Schedule post-launch retrospective',
      description: 'Discuss what went well...',
      statusId: doneStatus.id
    },
    {
      name: 'Begin gathering feature requests',
      description: 'Open a public suggestion board...',
      statusId: doneStatus.id
    }
  ];

  // Create tasks
  for (let i = 0; i < tasksData.length; i++) {
    const task = tasksData[i];
    const dateFields = getDatesForStatus(task.statusId);
    await prisma.task.create({
      data: {
        id: `task_${i + 1}`,
        name: task.name,
        description: task.description,
        projectId: project.id,
        statusId: task.statusId,
        dueDate: dateFields.dueDate,
        startAt: dateFields.startAt,
        endAt: dateFields.endAt
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
