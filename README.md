# ReviewGuard

ReviewGuard is an AI-powered web application that detects fake, suspicious, and genuine product reviews. It combines machine learning algorithms with large language models to analyze review text, scrape live product pages from major e-commerce platforms, and deliver a transparent verdict with detailed risk factors — all from just a URL or a single review.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [License](#license)

## Overview
This tool simplifies the review verification process by:
- Scraping product pages from Amazon, Flipkart, Meesho, Myntra, and more using Firecrawl.
- Extracting product information and individual reviews with Google Gemini 2.5 Flash.
- Analyzing review authenticity using an ensemble of 4 ML algorithms (Naive Bayes, Logistic Regression, TF-IDF Similarity, K-Nearest Neighbors).
- Computing a confidence score and listing the risk factors that drove the verdict.
- Storing each analysis in the user's private history for later review.

## Features
- Two analysis modes:
  - Manual single-review input (text + star rating).
  - Automated URL scraping of a full product page.
- Extracts:
  - Product name, price, seller, category, platform, overall rating.
  - Individual reviewer name, rating, date, title, text, verified status, helpful votes.
- ML Algorithm Analysis card showing:
  - Naive Bayes probability.
  - Logistic Regression score on engineered features.
  - TF-IDF cosine similarity vs known fake templates.
  - K-Nearest Neighbors top-3 vote.
  - Weighted ensemble fake probability.
- Heuristic risk factors: sentiment-rating mismatch, repetition, spam phrases, excessive capitals, generic content, and more.
- Animated, glassmorphic cybersecurity-themed UI built with Framer Motion.
- Full settings panel: light/dark theme, profile, change password, notifications, language, clear history, download reports, about, logout.
- Internationalization in 6 languages: English, Spanish, French, German, Hindi, Tamil.
- Email + Google authentication with OTP-based password recovery sent to Gmail.

## Installation
Clone the repository:
```bash
git clone https://github.com/your-username/ReviewGuard.git
cd ReviewGuard
```

Install the dependencies:
```bash
bun install
```

Configure environment variables (see `.env.example`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

Set backend secrets (for the edge function):
```
LOVABLE_API_KEY=your_ai_gateway_key
FIRECRAWL_API_KEY=your_firecrawl_key
```

Run the development server:
```bash
bun run dev
```

Open your browser and go to: http://localhost:8080

## Usage
1. Sign up or sign in with Email/Password or Google.
2. On the Dashboard, choose an analysis mode:
   - Paste a product URL to scrape and analyze all reviews automatically.
   - Or paste a single review text with a star rating for instant manual analysis.
3. Click **Analyze** and wait a few seconds.
4. Review the verdict (Genuine / Suspicious / Fake), confidence score, ML algorithm breakdown, risk factors, product info, and extracted reviews.
5. Open Settings to toggle theme, switch language, clear history, or download reports.

## Technologies Used
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Supabase (Auth, Postgres, Edge Functions, RLS)
- Firecrawl (anti-bot product page scraping)
- Google Gemini 2.5 Flash (review extraction & analysis)
- Custom ML library: Naive Bayes, Logistic Regression, TF-IDF, K-NN
- react-i18next (internationalization)
- Lucide Icons

## Folder Structure
```
ReviewGuard/
├── src/
│   ├── components/
│   │   ├── AnalysisForm.tsx
│   │   ├── ResultDisplay.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── Navbar.tsx
│   │   └── SettingsSheet.tsx
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   └── ResetPassword.tsx
│   ├── lib/
│   │   ├── reviewDetector.ts     # Heuristic detection engine
│   │   └── mlAlgorithms.ts       # ML ensemble (NB, LR, TF-IDF, KNN)
│   ├── i18n/
│   │   └── locales/              # en, es, fr, de, hi, ta
│   ├── contexts/AuthContext.tsx
│   ├── integrations/supabase/
│   └── index.css
├── supabase/
│   └── functions/
│       └── analyze-url/          # Firecrawl + Gemini analysis
├── public/
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## License
This project is licensed under the MIT License.

---
Developed by **Mohanraj** · Contact: [mohanraje2024@gmail.com](mailto:mohanraje2024@gmail.com)
