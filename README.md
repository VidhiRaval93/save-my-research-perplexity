# Save My Research – Perplexity Agent 🧠📚

An AI-powered research assistant that passively observes your Perplexity.ai sessions, summarizes content using OpenAI, and displays an organized, taggable history dashboard.

## ✨ Features

- 🕵️‍♀️ Chrome Extension: Extracts answers from Perplexity.ai automatically.
- 🔗 FastAPI Backend: Accepts POST requests and summarizes content using OpenAI GPT models.
- 📊 React + Tailwind Dashboard: Displays summaries grouped by time, source, and category.
- 🧠 Uses OpenAI for summarization with configurable `.env` support.
- 🔒 Local storage using `summaries.json` (can be extended to DB).

---

## 🧩 Tech Stack

| Layer           | Tooling                     |
|----------------|-----------------------------|
| Extension      | JavaScript (content script) |
| Backend        | Python, FastAPI, Pydantic   |
| Summarization  | OpenAI GPT API              |
| Frontend       | React, Tailwind CSS         |
| Storage        | JSON file (local)           |

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/VidhiRaval93/save-my-research-perplexity.git
cd save-my-research-perplexity
