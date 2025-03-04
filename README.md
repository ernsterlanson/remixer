# Content Remixer

A content remixing tool using React.

## Features

1. Paste in text we want to remix
2. Click a button to apply the remixing we want for it
3. Send the request to an AI API endpoint
4. See the remix in an output box
5. Add other styling and features that we want as we go

## Tech Stack

1. React
2. TailwindCSS
3. Vite
4. Claude API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd remixer
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Claude API key
   ```
   VITE_CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter or paste the text you want to remix in the input box
2. Select the type of remix you want to apply (summarize, elaborate, simplify, professional, or casual)
3. Click the "Remix Content" button
4. View the remixed content in the output box

## Deployment

To build the application for production:

```
npm run build
```

The build files will be generated in the `dist` directory, which can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.