# AI Voter List Extractor

An intelligent tool for election agents that uses the Google Gemini API to instantly digitize and analyze voter list documents. Go from a paper or PDF list to a structured, searchable, and queryable database in seconds.

## The Problem

Booth Level Agents and campaign managers often work with physical or scanned voter lists which are cumbersome and difficult to analyze. Manually searching for voters, gathering statistics, or identifying specific demographics is a slow, tedious, and error-prone process. This inefficiency can hinder effective on-the-ground campaign and election day operations.

## The Solution

The AI Voter List Extractor transforms this process. By simply uploading an image or PDF of a voter roll page, the application leverages the power of the Gemini multimodal AI to:
1.  **Read and Understand** the document layout.
2.  **Extract Key Information** with high accuracy.
3.  **Structure the Data** into a clean, usable format.
4.  **Provide an Intuitive Interface** to view, search, and chat with your data.

This empowers agents to get instant answers and insights, turning a static document into a dynamic asset.

## ✨ Key Features

-   **AI-Powered Data Extraction**: Utilizes the Gemini `gemini-2.5-flash` model to parse constituency details, polling station information, voter stats, and individual voter details from images (JPG, PNG, WEBP) and PDFs.
-   **Structured Data Display**: Presents extracted information in clean, easy-to-read summary cards.
-   **High-Performance Voter Table**: Displays the full voter list in a virtualized table that handles thousands of entries with smooth scrolling and instant searching.
-   **Conversational Chat Assistant**: Ask questions about the voter list in natural language (e.g., "Who lives in house number 123?", "Find voter ID WTD0416438", "How many male voters are there?"). Powered by `gemini-2.5-pro`.
-   **Rich UI Responses**: The chat assistant displays detailed voter information in visually appealing cards for quick reference.
-   **Persistent Sessions**: Reloading the page won't lose your work. The uploaded document, extracted data, and chat history are saved locally.
-   **Fully Responsive**: Designed to work seamlessly on desktops, tablets, and mobile devices.

## 🚀 How It Works

1.  **Upload**: The user uploads an image or PDF of a voter list page.
2.  **Extract**: The app sends the document to the Gemini API with a sophisticated prompt and a required JSON schema. The AI analyzes the document and returns perfectly structured data.
3.  **Display**: The extracted information is displayed on the "Extracted Details" tab, including a searchable table of all voters.
4.  **Chat**: The user switches to the "Chat Assistant" tab. Questions are sent to the Gemini API along with the full extracted data as context, allowing the AI to answer queries based solely on the provided document.

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Model**: Google Gemini API (`@google/genai`)
    -   `gemini-2.5-flash` for high-speed, accurate data extraction.
    -   `gemini-2.5-pro` for advanced reasoning in the chat assistant.

## ⚙️ Getting Started

To run this application, you need to have a Google Gemini API key.

1.  Obtain your API key from [Google AI Studio](https://aistudio.google.com/).
2.  Set up the environment variable `API_KEY` with your key. The application is configured to read this key from `process.env.API_KEY`.
3.  Open `index.html` in a modern web browser.

## 📂 Project Structure

```
.
├── components/          # Reusable React components
│   ├── ChatInterface.tsx
│   ├── ErrorDisplay.tsx
│   ├── FileUpload.tsx
│   ├── Header.tsx
│   ├── ResultsDisplay.tsx # Includes the virtualized voter table
│   ├── Spinner.tsx
│   └── Welcome.tsx
├── services/            # Modules for external API calls
│   └── geminiService.ts   # All logic for interacting with the Gemini API
├── App.tsx              # Main application component, state management
├── index.html           # Main HTML file
├── index.tsx            # Application entry point
├── metadata.json        # Application metadata
├── types.ts             # TypeScript type definitions
└── README.md            # You are here!
```
