import axios from 'axios';

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
export async function remixContent(
  text: string, 
  remixType: string
): Promise<string> {
  try {
    const prompt = getPromptForRemixType(remixType);
    
    // Use our backend server endpoint
    const response = await axios.post<ClaudeResponse>(
      '/api/remix',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${prompt}: ${text}`
          }
        ]
      }
    );
    
    // Extract text from the response
    if (response.data.content && response.data.content.length > 0) {
      return response.data.content[0].text;
    }
    
    return 'No response generated';
  } catch (error) {
    console.error('Error remixing content:', error);
    throw new Error('Failed to remix content. Please try again.');
  }
}

// Helper function to get the appropriate prompt based on remix type
function getPromptForRemixType(type: string): string {
  switch (type) {
    case 'summarize':
      return 'Summarize this text concisely';
    case 'elaborate':
      return 'Elaborate on this text with more details';
    case 'simplify':
      return 'Simplify this text for a 5th grade reading level';
    case 'professional':
      return 'Rewrite this text in a professional tone';
    case 'casual':
      return 'Rewrite this text in a casual, friendly tone';
    default:
      return 'Summarize this text concisely';
  }
} 