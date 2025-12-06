# Complete Setup Guide

Step-by-step instructions to get the YouTube AI Summarizer running on your system.

---

## Prerequisites Installation

### 1. Install Docker Desktop

**macOS:**
```bash
# Download from https://www.docker.com/products/docker-desktop
# Or use Homebrew:
brew install --cask docker
```

Start Docker Desktop and verify:
```bash
docker --version
docker-compose --version
```

---

### 2. Install Node.js

```bash
# macOS (using Homebrew):
brew install node

# Verify installation:
node --version  # Should be v18 or higher
npm --version
```

---

### 3. Install Ollama

**macOS:**
```bash
# Download from https://ollama.ai
# Or use Homebrew:
brew install ollama

# Start Ollama
ollama serve
```

**In a new terminal, pull the model:**
```bash
ollama pull qwen2.5:7b
```

---

### 4. Install Claude Desktop

Download from: https://claude.ai/download

---

## Project Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/youtube-ai-summarizer.git
cd youtube-ai-summarizer
```

---

### Step 2: Start Docker Services

```bash
# Build and start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# NAME                 STATUS         PORTS
# youtube-transcript   Up             0.0.0.0:3000->3000/tcp
# n8n                  Up             0.0.0.0:5678->5678/tcp
```

---

### Step 3: Configure n8n Workflow

1. **Open n8n:** http://localhost:5678

2. **Import workflow:**
   - Click workflow menu (three dots, top-right)
   - Select "Import from File"
   - Choose `n8n-workflow/youtube-summarizer-workflow.json`
   - Click "Import"

3. **Configure Ollama credentials:**
   - Click profile icon (top-right)
   - Select "Credentials"
   - Click "Add Credential"
   - Search for "Ollama"
   - Set **Base URL:** `http://host.docker.internal:11434`
   - Click "Save"

4. **Update workflow node:**
   - Open the imported workflow
   - Click on "Message a Model" (Ollama node)
   - Select your Ollama credential
   - Verify **Model** is set to `qwen2.5:7b`
   - Click "Save"

5. **Activate workflow:**
   - Toggle the switch in top-right corner (should turn blue/green)

---

### Step 4: Set Up MCP Server

```bash
# Navigate to MCP server directory
cd youtube-mcp-server

# Install dependencies
npm install

# Get absolute path for config
pwd
# Example output: /Users/yourusername/youtube-ai-summarizer/youtube-mcp-server
```

**Copy that path!**

---

### Step 5: Configure Claude Desktop

**macOS:**
```bash
# Open config file
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**If file is empty, paste this:**
```json
{
  "mcpServers": {
    "youtube-summarizer": {
      "command": "node",
      "args": [
        "/PASTE/YOUR/ABSOLUTE/PATH/HERE/youtube-mcp-server/index.js"
      ]
    }
  }
}
```

**If file already has content, add youtube-summarizer inside mcpServers:**
```json
{
  "mcpServers": {
    "existing-server": {
      ...
    },
    "youtube-summarizer": {
      "command": "node",
      "args": [
        "/PASTE/YOUR/ABSOLUTE/PATH/HERE/youtube-mcp-server/index.js"
      ]
    }
  }
}
```

Replace `/PASTE/YOUR/ABSOLUTE/PATH/HERE/` with the path from `pwd` command.

Save the file.

---

### Step 6: Restart Claude Desktop

1. **Completely quit Claude Desktop:**
   - Press `Cmd+Q` (don't just close the window)

2. **Reopen Claude Desktop**

3. **Verify MCP server loaded:**
   - Check Claude Desktop logs if needed:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

---

## Testing

### Test 1: Microservice

```bash
curl -X POST http://localhost:3000/transcript \
  -H "Content-Type: application/json" \
  -d '{"videoId":"8jPQjjsBbIc"}'
```

**Expected:** JSON with transcript text and word count.

---

### Test 2: n8n Workflow

```bash
curl -X POST http://localhost:5678/webhook/youtube-summary \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=8jPQjjsBbIc"}'
```

**Expected:** JSON with summary, key points, action items, and topics.

---

### Test 3: MCP Integration (Claude Desktop)

In Claude Desktop app, ask:

> "Summarize this YouTube video: https://www.youtube.com/watch?v=8jPQjjsBbIc"

**Expected:** Claude uses the `summarize_youtube_video` tool and returns a formatted analysis.

---

## Troubleshooting

### Docker Services Won't Start

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5678

# View logs
docker-compose logs youtube-transcript
docker-compose logs n8n

# Restart services
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose up --build -d
```

---

### Ollama Not Responding

```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve

# In another terminal, test
curl http://localhost:11434/api/tags

# List installed models
ollama list
```

---

### MCP Server Not Working

```bash
# Test MCP server manually
cd youtube-mcp-server
node index.js
# Should output: "YouTube Summarizer MCP Server running on stdio"
# Press Ctrl+C to stop

# Check Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# View Claude logs
tail -50 ~/Library/Logs/Claude/mcp*.log
```

---

### n8n Workflow Errors

1. **Check all services are running:**
   ```bash
   docker-compose ps
   ```

2. **View n8n execution logs:**
   - Open n8n: http://localhost:5678
   - Click clock icon (left sidebar)
   - View recent executions
   - Click on failed execution to see error details

3. **Common issues:**
   - Workflow not activated (toggle in top-right)
   - Ollama credentials not configured
   - Wrong model name in Ollama node
   - Microservice URL incorrect (should be `http://youtube-transcript:3000/transcript` when using Docker Compose network)

---

## Verification Checklist

- [ ] Docker Desktop running
- [ ] `docker-compose ps` shows both services "Up"
- [ ] Ollama running (`ollama list` shows qwen2.5:7b)
- [ ] n8n accessible at http://localhost:5678
- [ ] n8n workflow imported and activated
- [ ] MCP server installed (`npm install` completed)
- [ ] Claude Desktop config updated with absolute path
- [ ] Claude Desktop completely restarted
- [ ] Microservice test passes
- [ ] n8n workflow test passes
- [ ] Claude Desktop MCP test passes

---

## Next Steps

Once everything is working:

1. **Customize the prompt** in n8n "Build Prompt" node
2. **Add database storage** for persistent summaries
3. **Create additional MCP tools** for batch processing
4. **Integrate with other services** (Slack, email, etc.)
5. **Deploy to cloud** for always-on availability

See `docs/` directory for advanced guides.

---

## Getting Help

**Common Issues:**
- Check Docker logs: `docker-compose logs`
- Check n8n execution history in the UI
- Check Claude Desktop logs: `~/Library/Logs/Claude/`
- Verify all services: `docker-compose ps`

**Still stuck?**
- Open an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above

---

**Setup complete! You're ready to analyze YouTube videos with AI.** 🎉
