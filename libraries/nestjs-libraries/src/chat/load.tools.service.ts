import { Injectable, Logger } from '@nestjs/common';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import { pStore } from '@gitroom/nestjs-libraries/chat/mastra.store';
import { array, object, string } from 'zod';
import { ModuleRef } from '@nestjs/core';
import { toolList } from '@gitroom/nestjs-libraries/chat/tools/tool.list';
import dayjs from 'dayjs';
import { MCPClient } from '@mastra/mcp';

export const AgentState = object({
  proverbs: array(string()).default([]),
});

const renderArray = (list: string[], show: boolean) => {
  if (!show) return '';
  return list.map((p) => `- ${p}`).join('\n');
};

@Injectable()
export class LoadToolsService {
  constructor(private _moduleRef: ModuleRef) {}

  async loadTools() {
    return (
      await Promise.all<{ name: string; tool: any }>(
        toolList
          .map((p) => this._moduleRef.get(p, { strict: false }))
          .map(async (p) => ({
            name: p.name as string,
            tool: await p.run(),
          }))
      )
    ).reduce(
      (all, current) => ({
        ...all,
        [current.name]: current.tool,
      }),
      {} as Record<string, any>
    );
  }

  async agent() {
    const baseTools = await this.loadTools();
    return new Agent({
      id: 'Postlaa',
      name: 'Postlaa',
      description: 'Agent that helps manage and schedule social media posts for users',
      instructions: ({ requestContext }) => {
        const ui: string = requestContext.get('ui' as never);
        return `
      Global information:
        - Date (UTC): ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

      You are an autonomous marketing intelligence agent for Postlaa. You help businesses run their entire marketing operation — from research and strategy to content creation and scheduling.

      ## Your Capabilities
      You can:
        1. **Understand the business** — use projectContext tool to read what the user has set up (niche, audience, brand, goals, competitors, URL)
        2. **Research & Strategy** — when asked to plan content or a campaign, research the topic deeply:
           - Analyse the niche and what content performs well
           - Identify the target audience psychology (what motivates, worries, or excites them)
           - Research trends on each platform the user is active on
           - Identify competitor content gaps (what competitors DON'T post that the audience wants)
           - Define keywords and topics that align with SEO/ASO goals (if MCP tools are available, use them)
        3. **Build a Content Plan** — after research, create a structured 30-day (or custom duration) content plan with:
           - Topics with clear rationale (WHY each piece will work)
           - Platform-specific formats (carousel, short video, thread, article)
           - Hooks and CTAs for each piece
           - Suggested posting schedule
           - Save it via the campaignPlan tool
        4. **Create Content** — generate post text, images, and videos for any brief item
        5. **Schedule Posts** — schedule to any connected channels using the scheduling tools
        6. **Track Performance** — when asked, pull analytics to see what's working

      ## Working Rules
      - ALWAYS call projectContext first when a user wants help with content, campaigns, or marketing. Never create generic content — always tie it to the project brief.
      - When a user says "plan my marketing", "create a campaign", "what should I post", or similar: call projectContext → research the niche → build a content plan → present it for approval → only schedule after explicit user confirmation.
      - We call social platforms "channels" not "integrations" when talking to users.
      - When scheduling a post, always follow platform rules. Use integrationSchema tool to get platform-specific rules before scheduling.
      - For thread platforms (X, Threads, Bluesky): each array item = separate post in thread. For LinkedIn/Facebook: second item becomes a comment.
      - Always ask user confirmation with full details before scheduling any post.
      - HTML content: wrap each line in <p>. Allowed tags: h1, h2, h3, u, strong, li, ul, p. No "code" blocks.
      ${renderArray(
        [
          'If the user confirms scheduling, ask if they would like a modal with populated content instead of scheduling directly.',
        ],
        !!ui
      )}

      ## Campaign Planning Workflow
      When asked to plan a campaign or marketing strategy:
      1. Call projectContext to get project details
      2. Think deeply about the niche, audience, and goals
      3. Identify 8-12 content topics that would resonate with the target audience
      4. For each topic: assign a format, platform, hook, CTA, and clear rationale
      5. Build a posting schedule (frequency appropriate to platforms)
      6. Present the full plan to the user with explanations for each choice
      7. After user approval, save it with campaignPlan tool
      8. Offer to create and schedule the first batch of posts immediately
`;
      },
      model: openai('gpt-5.2'),
      tools: async ({ requestContext }) => {
        const mcpServersJson: string = requestContext.get('mcpServers' as never);
        if (!mcpServersJson) {
          return baseTools;
        }
        try {
          const servers = JSON.parse(mcpServersJson);
          const mcpClient = new MCPClient({ id: `req-${Date.now()}`, servers });
          const toolsets = await mcpClient.listToolsets();
          await mcpClient.disconnect();
          const mcpTools = Object.values(toolsets).reduce(
            (all, toolset) => ({ ...all, ...toolset }),
            {} as Record<string, any>
          );
          const merged = { ...baseTools, ...mcpTools };
          Logger.log(
            `LoadToolsService: merged ${Object.keys(mcpTools).length} external MCP tool(s) for request`,
            'LoadToolsService'
          );
          return merged;
        } catch (err) {
          Logger.warn(`LoadToolsService: failed to load MCP tools — ${err.message}`, 'LoadToolsService');
          return baseTools;
        }
      },
      memory: new Memory({
        storage: pStore,
        options: {
          generateTitle: true,
          workingMemory: {
            enabled: true,
            schema: AgentState,
          },
        },
      }),
    });
  }
}
