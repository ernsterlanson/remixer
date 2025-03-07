import { useState } from 'react'
import axios from 'axios'
import './App.css'

// API base URL - use environment variable or default to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [remixType, setRemixType] = useState('summarize')

  const handleRemix = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to remix')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Create a request that matches Claude API expectations
      const requestBody = {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${getPromptForRemixType(remixType)}: ${inputText}`
          }
        ]
      };
      
      console.log('Sending request:', requestBody);
      
      // Use our backend server endpoint
      const response = await axios.post(`${API_BASE_URL}/api/remix`, requestBody);
      
      console.log('Response received:', response.data);
      
      // Handle Claude API response format
      if (response.data && response.data.content) {
        // The content field in Claude API response is an array of content blocks
        const contentBlocks = response.data.content;
        // Extract text from the first text block
        const textContent = contentBlocks.find(block => block.type === 'text')?.text || '';
        setOutputText(textContent);
      } else {
        setError('Received an unexpected response format from the API');
        console.error('Unexpected response format:', response.data);
      }
    } catch (err) {
      console.error('Error remixing content:', err);
      
      // More detailed error handling
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.error || 'Failed to remix content';
        setError(`Error: ${errorMessage}`);
        console.error('Error response:', err.response.data);
      } else {
        setError('Failed to remix content. Please try again.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getPromptForRemixType = (type: string) => {
    switch (type) {
      case 'summarize':
        return 'Summarize this text concisely'
      case 'elaborate':
        return 'Elaborate on this text with more details'
      case 'simplify':
        return 'Simplify this text for a 5th grade reading level'
      case 'professional':
        return 'Rewrite this text in a professional tone'
      case 'casual':
        return 'Rewrite this text in a casual, friendly tone'
      default:
        return 'Summarize this text concisely'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Content Remixer</h1>
        
        <div className="mb-4">
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your text to remix:
          </label>
          <textarea
            id="input-text"
            className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text here..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose remix type:
          </label>
          <div className="flex flex-wrap gap-2">
            {['summarize', 'elaborate', 'simplify', 'professional', 'casual'].map((type) => (
              <button
                key={type}
                className={`px-3 py-1 rounded-md text-sm ${
                  remixType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setRemixType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={handleRemix}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Remixing...' : 'Remix Content'}
        </button>

        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {outputText && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Remixed Content:</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
