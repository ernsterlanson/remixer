import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: `Please remix this text in a creative way: ${inputText}`
          }]
        })
      })
      
      const data = await response.json()
      setOutputText(data.content[0].text)
    } catch (error) {
      console.error('Error:', error)
      setOutputText('An error occurred while remixing the text.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Content Remixer
        </h1>
        
        <textarea
          className="w-full h-40 p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <button
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleRemix}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Remixing...' : 'Remix Content'}
        </button>
        
        {outputText && (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Remixed Content:</h2>
            <p className="whitespace-pre-wrap">{outputText}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App 