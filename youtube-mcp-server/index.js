#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/youtube-summary";

// Helper function to call n8n
async function summarizeVideo(url) {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });
  
  if (!response.ok) {
    throw new Error(`n8n workflow failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Create MCP server
const server = new Server(
  {
    name: "youtube-summarizer",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "summarize_youtube_video",
        description: "Analyze and summarize a YouTube video. Returns structured insights including summary, key points, action items, and topics. Works with any YouTube URL.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "summarize_youtube_video") {
    try {
      const result = await summarizeVideo(args.url);
      
      // Format the response nicely
      const summary = result.summary?.content || result.summary || "No summary available";
      
      return {
        content: [
          {
            type: "text",
            text: `📹 **Video Analysis Complete**\n\n${summary}\n\n**Video ID:** ${result.videoId}\n**Word Count:** ${result.wordCount} words\n**Analyzed:** ${new Date(result.timestamp).toLocaleString()}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("YouTube Summarizer MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});