import axios from 'axios';

// API base URL - use environment variable or default to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Types for Claude API request and response based on the official SDK
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text';
    text: string;
  }>;
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Types for Claude API response
interface ClaudeResponseContent {
  type: string;
  text: string;
}

// Function to remix content using Claude API
export async function tweetsFromPost(
  text: string, 
): Promise<string> {
  try {
    console.log('tweetsFromPost called with text:', text.substring(0, 50) + '...');
    
    // Use a fixed prompt instead of getting it from remixType
    const prompt = `
You are a social media expert and ghostwriter.

You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post.

Since you are a ghostwriter, you need to make sure to follow the style, tone, and voice of the blog post as closely as possible.

Remember: Tweets cannot be longer than 280 characters.

Please return the tweets in a list format, with each tweet on a new line, and be sure to include at least five tweets.

Do not use any hashtags or emojis.

Here is the blog post:`;
    
    console.log('Using prompt:', prompt);
    
    // Use our backend server endpoint
    const response = await axios.post<ClaudeResponse>(
      `${API_BASE_URL}/api/remix`,
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${prompt}

${text}`
          }
        ]
      }
    );
    
    console.log('Response received:', response.status, response.statusText);
    
    // Extract text from the response
    if (response.data.content && response.data.content.length > 0) {
      console.log('Response content found, returning text');
      return response.data.content[0].text;
    }
    
    console.log('No response content found');
    return 'No response generated';
  } catch (error) {
    console.error('Error remixing content:', error);
    throw new Error('Failed to remix content. Please try again.');
  }
} 