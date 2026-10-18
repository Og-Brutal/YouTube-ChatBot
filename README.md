# YouTube ChatBot 🎬🤖

Ask questions about any YouTube video using AI. Powered by **Google Gemini** and a **RAG (Retrieval-Augmented Generation)** pipeline.

## How It Works

```
YouTube URL → Extract ID → Fetch Transcript → Chunk Text → Embed → FAISS Index
                                                                        ↓
User Question → Retrieve Relevant Chunks → Augment Prompt → Gemini LLM → Answer
```

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Python, FastAPI, LangChain (LCEL), FAISS, Gemini    |
| Frontend  | Next.js (App Router), TypeScript, Tailwind CSS      |
| LLM       | Google Gemini (configurable model)                  |
| Embeddings| Gemini Embedding 001                                |

## Project Structure

```
YouTube-ChatBot/
├── .env                  # API keys & config (not committed)
├── .env.example          # Template for .env
├── .gitignore
├── www.youtube.com_cookies.txt  # YouTube cookies (not committed)
├── backend/
│   ├── indexing.py       # URL → transcript → chunks → FAISS
│   ├── retriever.py      # Load FAISS index → retriever
│   ├── augmentation.py   # Prompt template & context formatting
│   ├── generation.py     # LLM & output parser config
│   ├── main.py           # FastAPI server with /index & /chat
│   └── requirements.txt
└── frontend/             # Next.js app
    └── src/
        ├── app/          # Pages & layout
        └── components/   # UrlForm, VideoCard, ChatWindow, etc.
```

## Setup

### 1. Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/YouTube-ChatBot.git
cd YouTube-ChatBot
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### 2. YouTube Cookies (Required)

Export cookies from your browser while logged into YouTube using the
[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) extension.

Save the file as `www.youtube.com_cookies.txt` in the project root.

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

## API Endpoints

| Method | Endpoint  | Body               | Description                        |
|--------|-----------|--------------------|------------------------------------|
| GET    | /health   | –                  | Health check                       |
| POST   | /index    | `{"url": "..."}`   | Index a YouTube video transcript   |
| POST   | /chat     | `{"query": "..."}` | Ask a question about the video     |

## Environment Variables

| Variable              | Required | Default             | Description                    |
|-----------------------|----------|---------------------|--------------------------------|
| GOOGLE_API_KEY        | Yes      | –                   | Google Gemini API key          |
| GEMINI_MODEL          | No       | gemini-2.5-flash    | Model for chat generation      |
| YOUTUBE_COOKIES_FILE  | Yes      | www.youtube.com_cookies.txt | Cookie file path     |

## License

MIT
