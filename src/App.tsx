import { useState } from 'react'
import './App.css'
import { tweetsFromPost } from './api/claude'

// API base URL - use environment variable or default to localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [editableTweets, setEditableTweets] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [currentEditIndex, setCurrentEditIndex] = useState(-1)
  const [modalText, setModalText] = useState('')

  const handleRemix = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to remix')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      console.log('Calling tweetsFromPost with input:', inputText.substring(0, 50) + '...');
      
      // Use the tweetsFromPost function from claude.ts
      const result = await tweetsFromPost(inputText);
      
      console.log('Result received from tweetsFromPost:', result.substring(0, 50) + '...');
      
      setOutputText(result);
      
      // Initialize editable tweets from the parsed result
      const parsedTweets = parseTweets(result);
      setEditableTweets(parsedTweets);
    } catch (err) {
      console.error('Error remixing content:', err);
      
      // Error handling
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to remix content. Please try again.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Function to parse tweets from the output text
  const parseTweets = (text: string) => {
    if (!text) return [];
    
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Find lines that look like tweets (either numbered or standalone)
    const tweetLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip header lines or explanatory text
      if (line.startsWith('Based on') || line.startsWith('Here are') || line.match(/^#+\s/)) {
        continue;
      }
      
      // Check if it's a numbered tweet (e.g., "1. Tweet content")
      if (line.match(/^\d+\.\s/)) {
        tweetLines.push(line.replace(/^\d+\.\s*/, '').trim());
        continue;
      }
      
      // If it's not empty and doesn't look like a header or explanation, it might be a tweet
      if (line.length > 0 && !line.includes('tweets') && !line.includes('Twitter')) {
        tweetLines.push(line);
      }
    }
    
    // Filter out any remaining non-tweet content and ensure we have reasonable tweet lengths
    return tweetLines
      .filter(tweet => tweet.length > 10 && tweet.length <= 280)
      .slice(0, 10); // Limit to 10 tweets max
  };

  // Function to handle tweet text changes
  const handleTweetChange = (index: number, newText: string) => {
    const updatedTweets = [...editableTweets];
    updatedTweets[index] = newText;
    setEditableTweets(updatedTweets);
  };

  // Function to open the edit modal
  const openEditModal = (index: number) => {
    setCurrentEditIndex(index);
    setModalText(editableTweets[index]);
    setModalOpen(true);
  };

  // Function to save changes from the modal
  const saveModalChanges = () => {
    if (currentEditIndex >= 0) {
      handleTweetChange(currentEditIndex, modalText);
      setModalOpen(false);
      setCurrentEditIndex(-1);
    }
  };

  // Function to close the modal without saving
  const closeModal = () => {
    setModalOpen(false);
    setCurrentEditIndex(-1);
  };

  // Function to open X (formerly Twitter) with pre-filled tweet
  const openXWithTweet = (tweet: string) => {
    const encodedTweet = encodeURIComponent(tweet);
    const xUrl = `https://x.com/intent/tweet?text=${encodedTweet}`;
    window.open(xUrl, '_blank');
  };

  // Calculate remaining characters for X's 280 character limit
  const getRemainingCharacters = (tweet: string) => {
    return 280 - tweet.length;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-8 px-4">
      <div className="container max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Tweet Generator</h1>
          
          <div className="mb-6">
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
              Paste your blog post:
            </label>
            <textarea
              id="input-text"
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your blog post here..."
            />
          </div>

          <button
            className="w-full bg-blue-400 text-white py-3 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-lg"
            onClick={handleRemix}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate Tweets'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {outputText && (
          <div className="px-6 md:px-8 pb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generated Tweets:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editableTweets.map((tweet, index) => (
                <div key={index} className="tweet-card bg-white rounded-lg border border-gray-200 shadow-sm p-5 relative">
                  <textarea
                    className="w-full p-0 border-0 bg-transparent text-gray-800 mb-3 text-base focus:outline-none focus:ring-0"
                    value={tweet}
                    onChange={(e) => handleTweetChange(index, e.target.value)}
                    rows={4}
                    spellCheck="false"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-sm ${getRemainingCharacters(tweet) < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {getRemainingCharacters(tweet)} characters remaining
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(index)}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => openXWithTweet(tweet)}
                        className="text-gray-800 hover:text-black text-sm font-medium flex items-center"
                        disabled={getRemainingCharacters(tweet) < 0}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Tweet</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 mb-4"
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                rows={8}
                spellCheck="false"
              />
              <div className="flex justify-between items-center">
                <span className={`text-sm ${getRemainingCharacters(modalText) < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {getRemainingCharacters(modalText)} characters remaining
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveModalChanges}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    disabled={getRemainingCharacters(modalText) < 0}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
