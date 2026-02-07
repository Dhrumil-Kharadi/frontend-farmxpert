# FarmXpert Frontend

A modern React frontend for the FarmXpert Multi-Agent AI Platform for Precision Farming.

## Features

- **Modern UI/UX**: Built with React 18, Styled Components, and Framer Motion
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Chat**: Interactive AI chat interface with the farming agents
- **Analytics Dashboard**: Comprehensive charts and data visualization
- **Agent Management**: View and manage all 22+ AI agents
- **Settings Panel**: Configure API keys, notifications, and preferences

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- FarmXpert backend running on http://localhost:8000

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Open your browser:**
Navigate to http://localhost:3000

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Sidebar.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Chat.js
│   │   ├── Agents.js
│   │   ├── Analytics.js
│   │   └── Settings.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Features Overview

### Dashboard
- Welcome section with quick actions
- Key performance metrics
- Weather overview
- Recent activity feed

### AI Chat
- Interactive chat with farming AI agents
- Quick action buttons
- Real-time responses
- Agent involvement tracking

### Agents
- View all 22+ specialized AI agents
- Organized by categories (Crop Planning, Farm Operations, Analytics, Supply Chain, Support)
- Agent status and controls
- Direct agent invocation

### Analytics
- Crop yield trends
- Profit distribution charts
- Soil health parameters
- Weather data visualization

### Settings
- Profile management
- Notification preferences
- API key configuration
- System settings

## API Integration

The frontend connects to the FarmXpert FastAPI backend through the `api.js` service file. Key endpoints include:

- `/health/live` - Health check
- `/agents` - List all agents
- `/agents/{agent_name}` - Invoke specific agent
- `/orchestrate` - Multi-agent workflow orchestration

## Environment Variables

Create a `.env` file in the frontend directory:

```bash
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Netlify/Vercel

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
