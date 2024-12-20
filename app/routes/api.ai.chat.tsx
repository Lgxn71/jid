import { ActionFunctionArgs } from '@remix-run/node';
import { ChatGroq } from '@langchain/groq';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { prisma } from '~/db.server';
import { authenticator } from '~/routes/auth+/server';

function replace_braces(text: string) {
  return text.replace(/{/g, '{{').replace(/}/g, '}}');
}

// Helper to simplify task data
function simplifyTask(task: any) {
  return {
    id: task.id,
    title: task.name,
    description: task.description,
    status: task.status?.name,
    assignees:
      task.assignees?.map((a: any) => ({
        id: a.id,
        name: a.firstName
      })) || [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    priority: task.priority
  };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) throw new Error('Not authenticated');

  const { query } = await request.json();

  try {
    // Initialize Groq chat model
    const model = new ChatGroq({
      apiKey: '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',
      model: 'llama-3.3-70b-versatile'
    });

    // Get tasks from database with limit
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          members: {
            some: {
              id: user.id
            }
          }
        }
      },
      include: {
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        status: {
          select: {
            id: true,
            status: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 30,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(tasks);

    // Simplify task data to reduce token count
    const simplifiedTasks = tasks.map(simplifyTask);

    const systemPrompt = `You are a helpful AI assistant for task management.
Available tasks (showing 30 most recent): ${JSON.stringify(simplifiedTasks, null, 2)}

When asked to create or modify a task, ONLY respond with a valid JSON object in this exact format:
{
  "type": "task_diff",
  "data": {
    "original": null,
    "modified": {
      "name": "string",
      "description": "string",
      "statusId": "${tasks[0]?.status?.id}",
      "priority": "Medium",
      "assigneeIds": [],
      "intent": "CREATE_TASK"
    }
  }
}

DO NOT include any additional text or explanation when creating/modifying tasks.
For other questions, respond in markdown format.

Example valid responses:
1. For task creation:
{"type":"task_diff","data":{"original":null,"modified":{"name":"Review documentation","description":"Review project docs","statusId":"${tasks[0]?.status?.id}","priority":"Medium","assigneeIds":[],"intent":"CREATE_TASK"}}}

2. For general questions:
Here's a summary of your tasks...`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', replace_braces(systemPrompt)],
      ['human', '{input}']
    ]);

    try {
      // Create streaming chain
      const chain = prompt.pipe(model).pipe(new StringOutputParser());

      // Stream response
      const stream = await chain.stream({
        input: query
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        }
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);

      // Handle rate limit errors specifically
      if (error.error?.type === 'tokens') {
        return new Response(
          JSON.stringify({
            content:
              'Sorry, the request was too large. I can only see the 10 most recent tasks. Please try asking about specific tasks or be more specific in your query.'
          }),
          { status: 200 }
        );
      }

      return new Response(
        JSON.stringify({
          content:
            'Sorry, there was an error processing your request. Please try again.'
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return new Response(
      JSON.stringify({
        content: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500 }
    );
  }
};
