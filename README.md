# 🎧 Egboy's Spotify History

A personal dashboard that visualizes your Spotify Extended Streaming History data. Explore your listening habits, discover your top artists and tracks, and analyze your music consumption patterns over time.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)

## ✨ Features

### 📊 Overview Dashboard
- Total listening time statistics
- Track and artist counts
- Year-over-year comparison
- Quick stats at a glance

### 🏆 Top Charts
- **Top Artists** - Your most played artists ranked by listening time
- **Top Tracks** - Your favorite songs with play counts and duration

### 📈 Timeline Analysis
- **Monthly Listening** - Visualize your listening patterns by month
- **Hourly Activity** - See what times of day you listen most

### 📜 History Browser
- Browse your complete streaming history
- Filter by year
- Search through your listening records

### 🔍 Analytics
- **Platform Breakdown** - See which devices you use to stream
- **Skip Analysis** - Understand your skipping behavior

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Vite** - Build tool

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Your Spotify Extended Streaming History data (JSON files)

### How to Get Your Spotify Data

1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Request your **Extended streaming history**
3. Wait for Spotify to email you (can take up to 30 days)
4. Download and extract the JSON files

### Installation

1. Clone the repository:
```bash
git clone https://github.com/egboy029/Egboy-Spotify-History.git
cd Egboy-Spotify-History
```

2. Install dependencies:
```bash
npm install
```

3. Add your Spotify data:
   - Place your `Streaming_History_Audio_*.json` files in `src/data/`

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
src/
├── components/
│   ├── Analytics/      # Platform & skip analysis
│   ├── History/        # Streaming history browser
│   ├── Layout/         # Dashboard layout
│   ├── Overview/       # Stats cards
│   ├── Timeline/       # Listening timeline charts
│   ├── TopCharts/      # Top artists & tracks
│   └── ui/             # Reusable UI components
├── data/               # Your Spotify JSON files
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── utils/              # Data processing utilities
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Screenshots

*Coming soon*

## 📝 License

This project is for personal use. Your Spotify data remains private and is processed entirely in your browser.

---

Built with 💚 using your Spotify Extended Streaming History data
