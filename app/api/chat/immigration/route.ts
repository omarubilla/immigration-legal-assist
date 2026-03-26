import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createImmigrationAgent } from "@/lib/ai/immigration-agent";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") ?? "en";

  const agent = createImmigrationAgent(lang);

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
