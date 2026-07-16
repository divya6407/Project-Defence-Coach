# Project Defense Coach

**AI-powered project presentation and defense coaching platform**

An intelligent platform that analyzes project defenses and presentations, providing real-time AI feedback, performance metrics, and actionable insights to help students and professionals improve their project presentation skills.

## 📋 Deep Dive

Project Defense Coach was developed to address the challenge students and professionals face when preparing for project defenses, thesis presentations, or technical project reviews. Traditional preparation methods lack objective feedback and personalized coaching. This platform uses AI to analyze presentation content, delivery, and technical depth, providing specific recommendations for improvement. It helps users identify weak points in their project explanations, technical justifications, and overall presentation structure, making defense preparation more data-driven and effective.

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Google Gemini API Key** (free from [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project_defense_coach
```

2. **Server Setup**
```bash
cd server
npm install
```

3. **Client Setup**
```bash
cd ../client
npm install
```

### Environment Variables

**Server `.env` file:**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

**Client `.env` file:**
```env
VITE_API_URL=http://localhost:5000
```

## 🛠️ Usage and Features

### Run Commands

**Server (Development):**
```bash
cd server
npm run dev
```

**Client (Development):**
```bash
cd client
npm run dev
```

**Production Build:**
```bash
cd client
npm run build
```

### Core Features

- **AI-Powered Analysis**: Uses Google Gemini to analyze project defense content
- **Real-Time Feedback**: Instant suggestions on presentation quality and technical depth
- **Performance Metrics**: Quantitative assessment of various defense aspects
- **Dashboard Analytics**: Visual representation of improvement areas
- **Technical Validation**: Checks technical accuracy and depth of project explanations
- **Presentation Structure**: Analyzes organization and flow of defense content
- **Responsive Design**: Mobile-friendly interface with Material UI components
- **Secure API Communication**: CORS-enabled backend with proper security measures

### Project Structure

```
project_defense_coach/
├── server/
│   ├── controller/
│   │   └── analyzeController.js    # Request handling logic
│   ├── routes/
│   │   └── analyze.js              # API route definitions
│   ├── services/
│   │   └── geminiService.js        # Gemini AI integration
│   ├── test/
│   │   └── test.js                 # Testing utilities
│   ├── .env                        # Environment variables
│   ├── package.json
│   └── index.js                    # Express server entry point
├── client/
│   ├── api/
│   │   └── axiosConfig.js          # API client configuration
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Main dashboard interface
│   │   │   ├── AnalysisPanel.jsx  # Analysis results display
│   │   │   └── FeedbackForm.jsx   # Input forms
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   └── Analysis.jsx       # Analysis interface
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🧰 Tech Stack & Architecture

### Frontend
- **React 19** - UI library with modern hooks
- **Vite** - Fast build tool and dev server
- **Material UI (MUI)** - React component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Emotion** - CSS-in-JS styling for MUI

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Google Gemini API** - AI analysis and feedback generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **ES6 Modules** - Modern JavaScript modules

### AI Integration
- **Google Gemini 2.0+** - Primary AI model for analysis
- **Structured Prompts** - Custom instructions for defense analysis
- **Response Parsing** - Structured data extraction from AI responses
- **Feedback Generation** - Actionable improvement suggestions

### System Design

```
┌─────────────┐
│   Frontend  │ (React + MUI + Tailwind)
└──────┬──────┘
       │ HTTP Requests
       ↓
┌─────────────┐
│   Backend   │ (Express + API Routes)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Controller  │ (Request Processing)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Gemini    │ (AI Analysis)
│   Service   │ (Feedback Generation)
└─────────────┘
       │
       ↓
┌─────────────┐
│  Response   │ (Structured Analysis)
│  Formatting │ (Metrics & Insights)
└─────────────┘
```

## 🔍 API Endpoints

### Health Check
```
GET /api/ping
```

### Analyze Defense
```
POST /api/analyze
Body: {
  "projectTitle": "Project Name",
  "defenseContent": "Presentation text or transcript...",
  "technicalDetails": "Technical specifications...",
  "questions": ["Expected questions..."]
}
```

### Get Analysis History
```
GET /api/analysis/history
```

## 📊 Analysis Categories

### Content Quality
- **Clarity**: How well the project is explained
- **Structure**: Organization of presentation flow
- **Completeness**: Coverage of essential aspects

### Technical Depth
- **Accuracy**: Technical correctness of explanations
- **Depth**: Level of technical detail provided
- **Justification**: Rationale for technical decisions

### Presentation Skills
- **Confidence**: Projected confidence in responses
- **Preparation**: Evidence of thorough preparation
- **Adaptability**: Ability to handle unexpected questions

## 📝 Notes

- **API Security**: Ensure proper API key management and rotation
- **CORS Configuration**: Backend configured for specific client origins
- **Error Handling**: Graceful degradation when AI service is unavailable
- **Performance**: Analysis time depends on content length and AI response time
- **Browser Compatibility**: Modern browsers with ES6+ support required

## 🚀 Future Enhancements

- [ ] User authentication and history tracking
- [ ] Voice input for verbal defense practice
- [ ] Real-time transcription during live presentations
- [ ] Integration with video recording
- [ ] Peer review and collaboration features
- [ ] Custom analysis templates for different domains
- [ ] Multi-language support
- [ ] Advanced analytics and progress tracking
- [ ] Export analysis reports as PDF
- [ ] Integration with academic institutions

## 🤝 Contributions & License

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or feedback about this project, please reach out via:
- **Email**: divyashree6407@gmail.com
- **LinkedIn**: https://linkedin.com/in/divya-shree-bb6b35331
- **GitHub**: https://github.com/divya6407

---

*Built with ❤️ using React, Node.js, Google Gemini, and Material UI*