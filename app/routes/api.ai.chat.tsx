import { ActionFunctionArgs } from '@remix-run/node';
import { ChatGroq } from '@langchain/groq';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { prisma } from '~/db.server';
import { authenticator } from '~/routes/auth+/server';

function replace_braces(text) {
  return text.replace(/{/g, '{{').replace(/}/g, '}}');
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) throw new Error('Not authenticated');

  const { query } = await request.json();

  // Initialize Groq chat model
  const model = new ChatGroq({
    apiKey: "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",
    model: "llama-3.3-70b-versatile"
  });

  // Get tasks from database
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
      assignees: true,
      status: true
    }
  });

  const systemPrompt = `You are a helpful AI assistant for task management.
Available tasks: ${JSON.stringify(tasks, null, 2)}

For task creation or modification requests, respond with a JSON object in this format:
{
  "type": "task_diff",
  "data": {
    "original": null,
    "modified": {
      "title": "string",
      "description": "string",
      "status": "string",
      "assigneeIds": ["string"],
      "dueDate": "string"
    }
  }
}

For task modifications, include the original task in the "original" field.
For general questions, provide a helpful response in markdown format.`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", replace_braces(systemPrompt)],
    ["human", "{input}"]
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
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}; 