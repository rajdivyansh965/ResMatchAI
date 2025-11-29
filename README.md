
# ResuMatch AI 🚀

> **Enterprise-Grade AI Resume Analytics & ATS Optimization Platform**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-sky)

ResuMatch AI is a modern, full-stack application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). It leverages **Google's Gemini 2.5 Flash** model to provide real-time feedback, semantic job matching, and career strategy insights.

---

## ✨ Key Features

### 1. 📄 Intelligent Resume Parsing & Analysis
- **Multi-Format Support:** Handles PDF and Text uploads using `pdfjs-dist`.
- **ATS Scoring Engine:** Evaluates resumes on Impact, Brevity, Style, and Section Completeness (0-100 score).
- **Deep Content Analysis:** Identifies missing keywords, quantifies impact metrics, and flags formatting issues.

### 2. 🎯 Semantic Job Matching
- **Vector-Like Comparison:** Uses LLM reasoning to compare resume context against Job Descriptions.
- **Gap Analysis:** explicitly lists missing hard skills and experience gaps.
- **Match Score:** Provides a "Hiring Manager" perspective on fit (Low/Moderate/High/Excellent).

### 3. ✍️ AI Writing Assistant
- **Tailored Content:** Automatically rewrites Professional Summaries to target specific JDs.
- **Cover Letter Generator:** Drafts compelling cover letters bridging past experience to future roles.
- **Skill Re-ranking:** Optimizes skill order based on job requirements.

### 4. 🧭 Career Advisor & Market Scanner
- **Live Job Search:** Uses **Google Search Grounding** to find real-time job openings and internships.
- **Strategic Insights:** Provides specific "How to Crack It" advice based on the user's current skill profile.

### 5. 📊 Enterprise Dashboard
- **Visual Analytics:** Radial gauges and radar charts (Recharts) for performance visualization.
- **Observability:** Real-time tracking of AI Token Usage, Latency, and Estimated Cost per request.
- **Persistence:** LocalStorage integration to save progress between sessions.

---

## 🛠️ Technical Stack

**Frontend & Logic**
- **Framework:** React 19 (Vite)
- **Language:** TypeScript (Strict Mode)
- **State Management:** React Hooks + LocalStorage
- **Styling:** Tailwind CSS + Lucide React Icons
- **Visualization:** Recharts

**AI & Infrastructure**
- **Model:** Google Gemini 2.5 Flash
- **SDK:** `@google/genai`
- **Features:** System Instructions, JSON Schema Enforcement, Search Grounding

**DevOps & Quality**
- **Build:** Vite
- **Linting:** ESLint
- **Type Safety:** Comprehensive Interface definitions (Zod-ready structure)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resumatch-ai.git
   cd resumatch-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   # API Key is injected via Vite/Process env in the demo, 
   # but for local dev, ensure your environment is set up.
   API_KEY=your_google_gemini_api_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 🧠 System Architecture

### The "Gemini Service" Layer
The application uses a centralized `GeminiService` class that implements the **Repository/Service pattern**:

- **Resilience:** Implements exponential backoff retry logic for API stability.
- **Cost Tracking:** Wraps every call to calculate input/output token costs.
- **Structured Output:** Enforces JSON Schemas for predictable UI rendering.

```typescript
// Example: Structured output enforcement
const atsAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { ... },
    missingKeywords: { type: Type.ARRAY, ... },
    // ...
  }
};
```

---

## 📸 Screenshots

| Dashboard | Job Matcher |
|:---:|:---:|
| *Analysis Radar Charts & Scores* | *Semantic Gap Analysis & Tailoring* |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for the Dev Community
</p>
