import axios from 'axios';

// Types for Claude API request and response
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

// Function to remix content using Claude API
export async function remixContent(
  text: string, 
  remixType: string
): Promise<string> {
  try {
    const prompt = getPromptForRemixType(remixType);
    
    const response = await axios.post<ClaudeResponse>(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `${prompt}: ${text}`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY || '',
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
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