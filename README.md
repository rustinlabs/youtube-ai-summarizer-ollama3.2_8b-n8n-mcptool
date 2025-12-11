# YouTube AI Summarizer with MCP Integration

An end-to-end AI automation system that analyzes YouTube videos using a custom microservice, n8n workflow automation, local LLM processing (Ollama), and Model Context Protocol (MCP) integration with Claude Desktop.

![Architecture Diagram](docs/architecture.png)

## 🎯 Features

- **YouTube Transcript Extraction**: Custom Node.js microservice fetches video transcripts
- **AI Analysis**: Local LLM (Ollama) generates structured summaries with key points and action items
- **Workflow Automation**: n8n orchestrates the entire pipeline
- **MCP Integration**: Conversational access through Claude Desktop
- **Containerized**: Docker & Docker Compose for easy deployment
- **Zero API Costs**: Runs entirely on local infrastructure

## 🏗️ Architecture

```
User Request (Claude Desktop)
    ↓
MCP Server (Node.js)
    ↓
n8n Workflow (Docker)
    ↓
YouTube Transcript Microservice (Docker)
    ↓
Ollama LLM (Local)
    ↓
Structured Summary Response
```

### Components

1. **YouTube Transcript Microservice** (`youtube-transcript-api/`)
   - Express.js API server
   - Fetches YouTube video transcripts using youtubei.js
   - Dockerized for consistent deployment
   - Exposes REST API on port 3000

2. **n8n Workflow** (`n8n-workflow/`)
   - Webhook trigger receives YouTube URLs
   - Extracts video ID
   - Calls transcript microservice
   - Sends to Ollama for AI analysis
   - Returns structured JSON response

3. **MCP Server** (`youtube-mcp-server/`)
   - Implements Model Context Protocol
   - Bridges Claude Desktop to n8n workflow
   - Provides conversational interface
   - Tool: `summarize_youtube_video`

4. **Ollama Integration**
   - Local LLM processing (qwen2.5:7b recommended)
   - Zero API costs
   - Full data privacy
   - Customizable prompts

## 📋 Prerequisites

- **Docker Desktop** (latest version)
- **Node.js** 18+ and npm
- **Ollama** installed and running
- **Claude Desktop** app (for MCP integration)
- **n8n** (via Docker)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/youtube-ai-summarizer.git
cd youtube-ai-summarizer
```

### 2. Install Ollama Model

```bash
ollama pull qwen2.5:7b
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This starts:
- YouTube Transcript Microservice (port 3000)
- n8n (port 5678)

### 4. Configure n8n Workflow

1. Open n8n at http://localhost:5678
2. Import workflow: `n8n-workflow/youtube-summarizer-workflow.json`
3. Activate the workflow

### 5. Set Up MCP Server

```bash
cd youtube-mcp-server
npm install
```

Configure Claude Desktop:

```bash
# macOS
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "youtube-summarizer": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/youtube-mcp-server/index.js"
      ]
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/` with your actual path.

### 6. Restart Claude Desktop

Completely quit and reopen Claude Desktop.

### 7. Test It!

In Claude Desktop, ask:

> "Summarize this YouTube video: https://www.youtube.com/watch?v=8jPQjjsBbIc"

## 📖 Usage

### Via Claude Desktop (Recommended)

```
You: "Summarize this YouTube video: https://www.youtube.com/watch?v=VIDEO_ID"

Claude: [Uses MCP tool to analyze and return structured summary]
```

### Via API (Direct)

```bash
curl -X POST http://localhost:5678/webhook/youtube-summary \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

### Response Format

```json
{
  "success": true,
  "videoId": "8jPQjjsBbIc",
  "url": "https://www.youtube.com/watch?v=8jPQjjsBbIc",
  "summary": {
    "content": "SUMMARY: [One sentence summary]\n\nKEY POINTS:\n- Point 1\n- Point 2\n- Point 3\n\nACTION ITEMS:\n- Action 1\n- Action 2\n\nTOPICS: topic1, topic2, topic3"
  },
  "wordCount": 2074,
  "timestamp": "2024-12-05T20:50:40.390Z"
}
```

## 🛠️ Configuration

### Changing the LLM Model

Edit the n8n workflow Ollama node:

- **qwen2.5:7b** - Balanced accuracy and speed (recommended)
- **llama3.1:8b** - Better instruction following
- **llama3.2:3b** - Fastest but less accurate

### Customizing the Prompt

Edit the "Build Prompt" node in the n8n workflow to adjust:
- Output format
- Analysis depth
- Specific insights to extract

### Adjusting LLM Temperature

Lower temperature (0.1-0.3) = More factual, less creative
Higher temperature (0.7-1.0) = More creative, higher hallucination risk

Recommended: **0.3** for summaries

## 📁 Project Structure

```
youtube-ai-summarizer/
├── youtube-transcript-api/      # Microservice
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── youtube-mcp-server/          # MCP Integration
│   ├── index.js
│   └── package.json
├── n8n-workflow/                # Automation Workflow
│   └── youtube-summarizer-workflow.json
├── docker-compose.yml           # Orchestration
├── docs/                        # Documentation
│   ├── MICROSERVICE.md
│   ├── MCP_SETUP.md
│   └── DOCKER_GUIDE.md
├── .gitignore
└── README.md
```

## 🔧 Troubleshooting

### MCP Server Not Showing in Claude

1. Check Claude Desktop config path is correct
2. Verify absolute path to `index.js`
3. Check Claude Desktop logs: `~/Library/Logs/Claude/`
4. Ensure you completely quit and reopened Claude Desktop

### Microservice Connection Refused

```bash
# Check if container is running
docker ps

# View logs
docker logs youtube-transcript

# Restart container
docker restart youtube-transcript
```

### Ollama Not Responding

```bash
# Check if Ollama is running
ollama list

# Start Ollama
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

### n8n Workflow Errors

1. Verify all services are running: `docker-compose ps`
2. Check n8n logs: `docker logs n8n`
3. Ensure workflow is activated (toggle in top-right)
4. For Docker n8n, use `http://host.docker.internal:3000` for microservice
5. For Docker n8n, use `http://host.docker.internal:11434` for Ollama

## 🚀 Advanced Usage

### Database Storage (Optional)

Add SQLite storage to persist summaries:

```bash
# Install SQLite in n8n
# Add SQLite node to workflow after "Parse LLM Response"
```

See `docs/DATABASE_SETUP.md` for details.

### Batch Processing

Process multiple videos:

```javascript
// In MCP server, add batch tool
{
  name: "batch_summarize_videos",
  description: "Summarize multiple YouTube videos",
  inputSchema: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
}
```

### Integration with Other Services

- **Slack**: Post summaries to channels
- **Email**: Send daily digest of analyzed videos
- **Notion**: Save to database
- **Google Sheets**: Log all summaries

## 🎓 Educational Value

This project demonstrates:

- **Microservices Architecture**: Independent, containerized services
- **Workflow Automation**: n8n for orchestration
- **AI Integration**: Local LLM deployment and prompting
- **MCP Protocol**: Cutting-edge AI tool-use protocol
- **Docker**: Containerization and networking
- **API Design**: RESTful endpoints
- **Error Handling**: Robust error management
- **Production Practices**: Health checks, logging, restart policies

## 📊 Performance

- **Transcript Fetch**: 500-2000ms (depends on video length)
- **LLM Processing**: 2-10 seconds (depends on model and transcript length)
- **Total Pipeline**: ~5-15 seconds end-to-end
- **Memory Usage**: ~300MB total (all containers)
- **Cost**: $0 (fully local)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Anthropic** - Claude Desktop and MCP protocol
- **n8n** - Workflow automation platform
- **Ollama** - Local LLM deployment
- **youtubei.js** - YouTube transcript extraction

## 📧 Contact

Rustin Kormos -

Project Link: https://github.com/rustinlabs/youtube-ai-summarizer

---

## 🎯 Use Cases

- **Content Creators**: Quickly analyze competitor videos
- **Researchers**: Extract key points from educational content
- **Educators**: Summarize lecture videos for students
- **Businesses**: Analyze industry webinars and conferences
- **Personal**: Build a searchable knowledge base from saved videos

---

**Built with ❤️ by Rustin Kormos**