# Sage

**AI-Powered Speech, Language, and Cognitive Pattern Recognition**

Sage is a voice-first AI application designed to support cognitive health in older adults through natural conversation analysis and gentle, engaging brain activities.

![Sage](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## 🎯 Overview

Sage helps track changes in language ability, memory, attention, and emotional state over time. Instead of relying on formal testing, the app learns from everyday conversations and short, engaging brain games.

### Target Audience
- Elderly individuals with mild to moderate cognitive decline
- Those living independently, with family support, or in assisted living settings
- Family members and caregivers seeking dignified insight tools

## ✨ Features

### 1. Speech & Language Pattern Recognition
- **Real-time speech analysis** using Flesch-Kincaid grade level metrics
- **Tracks**: Sentence length, vocabulary complexity, grammar consistency
- **Detects**: Repeated questions, hesitation patterns, speech rate changes
- **Output**: Language complexity trends, time-of-day analysis, pattern alerts

### 2. Measurable Brain Games
Four categories of gentle, conversational activities:

- **Memory Recall**: Stories and follow-up questions
- **Attention & Focus**: Word counting and pattern detection
- **Language Formation**: Sentence completion and naming tasks
- **Processing Speed**: Timed category naming challenges

### 3. Emotional State Detection
- Analyzes voice for emotional indicators
- Detects: Calm, Happy, Anxious, Sad, Agitated states
- Automatic calming mode activation
- Emotional pattern logging and visualization

### 4. Family Memory Hub
- Store family member profiles and relationships
- Share memories and life stories
- Family updates in simple language
- AI uses memories to personalize conversations

### 5. Adaptive Conversation Intelligence
- Auto-adjusts sentence complexity
- Uses familiar names and phrasing
- Slows pace during confusion
- Avoids challenging activities during stress

### 6. Caregiver Dashboard
- Language complexity trends over time
- Brain game performance tracking
- Emotional state patterns
- Time-of-day cognitive changes
- All visualized as clear, non-clinical graphs

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (with persistence)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Sage.git
cd Sage

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📱 App Structure

```
src/
├── app/                    # Next.js app router
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main entry point
├── components/
│   ├── features/           # Feature components
│   │   ├── BrainGames.tsx     # Cognitive games
│   │   ├── FamilyHub.tsx      # Family connections
│   │   ├── HomePage.tsx       # Dashboard home
│   │   ├── InsightsDashboard.tsx  # Analytics
│   │   └── VoiceRecorder.tsx  # Speech recording
│   ├── icons/              # Icon components
│   ├── layout/             # Layout components
│   ├── onboarding/         # Onboarding flow
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities
│   ├── gameData.ts         # Brain game content
│   ├── mockData.ts         # Demo data generators
│   └── speechAnalysis.ts   # NLP analysis functions
├── store/                  # State management
│   └── useStore.ts         # Zustand store
└── types/                  # TypeScript types
    └── index.ts
```

## 🎨 Design Philosophy

### Color Palette
- **Sage Green** (`#8BA888`): Primary, calming, trustworthy
- **Terracotta** (`#C4846C`): Secondary, warm, engaging
- **Cream/Sand** (`#FDF8F3`): Background, soft, accessible
- **Emotional Colors**: Calm, Happy, Anxious, Sad, Agitated states

### Typography
- **Display**: Playfair Display (serif) - warmth and elegance
- **Body**: Source Sans 3 - highly readable, accessible

### Accessibility
- Large, readable text (1.125rem base)
- High contrast ratios
- Clear visual hierarchy
- Touch-friendly targets
- Reduced motion support

## 📊 How the AI Works

The AI analyzes:
1. **Spoken language complexity** using Flesch-Kincaid grade level metrics
2. **Speech patterns**: rate, pauses, and repetition
3. **Emotional tone** through keyword and sentiment analysis
4. **Performance trends** in cognitive activities

These signals combine to build a personalized cognitive profile that evolves over time.

### Example Insights

> "Language complexity has gradually declined during evening conversations, with increased repetition after 5 PM."

> "Memory recall performance remained stable, while response time increased slightly over the past two weeks."

## 🔮 Future Enhancements

- [ ] Real voice recording with Web Speech API
- [ ] Cloud sync for family sharing
- [ ] Push notifications for insights
- [ ] Voice synthesis for responses
- [ ] Integration with health platforms
- [ ] Multi-language support

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ for cognitive wellness
