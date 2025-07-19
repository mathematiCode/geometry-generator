import 'server-only';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';

import { spinner, BotMessage, SystemMessage } from '@/components/llm-stocks';

import {
  runAsyncFnWithoutBlocking,
  sleep,
  formatNumber,
  runOpenAICompletion,
} from '@/lib/utils';
import { polygonDrawPrompt, cuboidDrawPrompt } from './ai-function-prompts';
import { CuboidEditor, PolygonEditor } from '@/components/geometry/editors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function submitUserMessage(content: string, newPath?: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `\
You are a math visualisation assistant specializing in geometric shapes.
You and the user can create math geometry for teaching math.

Messages inside [] means that it's a UI element or a user event. For example:
- '[User has changed the shape points to "50,150 250,150 200,50 100,50"]' means that the user has changed the shape to a new value.
`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [polygonDrawPrompt, cuboidDrawPrompt],
    temperature: 0.1,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(<BotMessage>{content}</BotMessage>);
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall('draw_shape', async props => {
    reply.done(<PolygonEditor {...props} />);

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'draw_shape',
        content: JSON.stringify(props),
      },
    ]);
  });

  completion.onFunctionCall('draw_cuboid', async props => {
    reply.done(<CuboidEditor {...props} />);

    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'draw_solid_geometry',
        content: JSON.stringify(props),
      },
    ]);
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
    // confirmPurchase,
  },
  initialUIState,
  initialAIState,
});
