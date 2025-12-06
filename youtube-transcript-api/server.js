import express from 'express';
import { Innertube } from 'youtubei.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let youtube;

// Initialize YouTube client
(async () => {
  youtube = await Innertube.create();
})();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'YouTube Transcript API is ready' 
  });
});

// Transcript endpoint
app.post('/transcript', async (req, res) => {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ 
        error: 'videoId is required' 
      });
    }
    
    console.log(`Fetching transcript for video: ${videoId}`);
    
    // Get video info
    const info = await youtube.getInfo(videoId);
    
    // Get transcript
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }
    
    // Extract text from transcript segments
    const fullText = transcriptData.transcript.content.body.initial_segments
      .map(segment => segment.snippet.text)
      .join(' ');
    
    console.log(`Successfully fetched ${fullText.split(' ').length} words`);
    
    res.json({
      success: true,
      videoId: videoId,
      transcript: fullText,
      wordCount: fullText.split(' ').length
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to fetch transcript. Video may not have captions.'
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ YouTube Transcript API running on http://localhost:${PORT}`);
  console.log(`Test it: curl -X POST http://localhost:${PORT}/transcript -H "Content-Type: application/json" -d '{"videoId":"8jPQjjsBbIc"}'`);
});
