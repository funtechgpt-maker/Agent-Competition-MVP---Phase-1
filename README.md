# AI Agent Competition System (MVP)

A minimal autonomous AI agent competition system where agents act autonomously and compete every 6 hours.

## 🎯 Features

- **Agent Deployment**: Users can deploy AI agents with different strategies (aggressive, balanced, conservative)
- **Autonomous Agents**: Agents automatically perform actions (earn, spend, compete) every 30 seconds
- **Competition Cycle**: Every 6 hours, the system evaluates all agents and declares a winner
- **Leaderboard**: Real-time ranking of agents by score
- **Winner History**: Track all competition winners

## 🏗️ Architecture

### Backend
- **Node.js + Express**: REST API server
- **In-memory Store**: Simple data storage (no database required)
- **Cron Jobs**: Automated competition evaluation and agent simulation
- **Agent Model**: Autonomous agents with strategy-based behavior

### Frontend
- **Vanilla HTML/JS**: Simple, lightweight frontend
- **Auto-refresh**: Updates every 10 seconds
- **Real-time Stats**: Competition statistics and leaderboard

## 📦 Project Structure

```
agent-competition-mvp/
├── backend/
│   ├── models/
│   │   └── agent.js          # Agent model with actions
│   ├── routes/
│   │   └── agents.js         # API routes
│   ├── services/
│   │   └── competition.js    # Competition logic
│   ├── store.js              # In-memory data store
│   ├── server.js             # Express server
│   └── package.json
├── frontend/
│   ├── index.html            # Main UI
│   └── app.js                # Frontend logic
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

**Note**: For development with auto-reload, use:
```bash
npm run dev
```

### Frontend Setup

1. Open `frontend/index.html` in a web browser

OR serve it with a simple HTTP server:

```bash
# Using Python
cd frontend
python -m http.server 8000

# Using Node.js http-server (if installed)
npx http-server -p 8000
```

2. Open `http://localhost:8000` in your browser

## 📡 API Endpoints

### POST `/api/deploy-agent`
Deploy a new agent.

**Request Body:**
```json
{
  "owner": "user123",
  "strategyType": "balanced"
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "owner": "user123",
    "balance": 900,
    "strategyType": "balanced",
    "score": 0,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/agents`
Get all agents (optionally filter by owner).

**Query Params:**
- `owner` (optional): Filter by owner ID

**Response:**
```json
{
  "agents": [...],
  "count": 5
}
```

### GET `/api/leaderboard`
Get top agents by score.

**Query Params:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "leaderboard": [...],
  "count": 10,
  "lastEvaluation": "2024-01-01T00:00:00.000Z",
  "nextEvaluation": "2024-01-01T06:00:00.000Z"
}
```

### GET `/api/last-winner`
Get the last competition winner.

**Response:**
```json
{
  "winner": {
    "agentId": "uuid",
    "owner": "user123",
    "score": 1500,
    "balance": 2000,
    "strategyType": "aggressive",
    "timestamp": "2024-01-01T06:00:00.000Z"
  },
  "totalWinners": 1
}
```

### GET `/api/stats`
Get competition statistics.

**Response:**
```json
{
  "totalAgents": 10,
  "activeAgents": 10,
  "totalScore": 5000,
  "totalBalance": 10000,
  "averageScore": 500,
  "averageBalance": 1000,
  "lastEvaluation": "2024-01-01T00:00:00.000Z",
  "nextEvaluation": "2024-01-01T06:00:00.000Z",
  "totalWinners": 1
}
```

## 🤖 Agent System

### Agent Properties
- **id**: Unique identifier
- **owner**: User ID / wallet address
- **balance**: Mock x402 currency (starts at 1000, minus 100 deployment fee)
- **strategyType**: `aggressive`, `balanced`, or `conservative`
- **score**: Competition score (increases through actions)
- **status**: `active` or `inactive`

### Agent Actions
Agents automatically perform these actions every 30 seconds:

1. **Earn**: Generate mock x402 based on strategy
   - Aggressive: 20-150 x402 (higher variance)
   - Balanced: 25-100 x402
   - Conservative: 30-80 x402 (lower variance)

2. **Spend**: Use x402 based on strategy
   - Aggressive: 15-25% of balance
   - Balanced: 8-15% of balance
   - Conservative: 5-10% of balance

3. **Compete**: Generate competition score
   - Score = (balance_weight × 100 × strategy_multiplier × competition_factor)
   - Aggressive: 1.3x multiplier
   - Balanced: 1.0x multiplier
   - Conservative: 0.9x multiplier

## 🏆 Competition Cycle

- **Simulation Tick**: Every 30 seconds, all active agents perform actions
- **Evaluation**: Every 6 hours, the system:
  1. Ranks all agents by score
  2. Declares the top agent as winner
  3. Logs winner to history
  4. Partially resets scores (keeps 10% to maintain history)

## 🧪 Testing

### Manual Testing

1. Start the backend server
2. Open the frontend in a browser
3. Deploy multiple agents with different strategies
4. Watch the leaderboard update in real-time
5. Wait for the competition evaluation (or modify cron schedule for testing)

### Testing Competition Cycle Faster

To test the 6-hour cycle faster, modify `backend/server.js`:

```javascript
// Change from: '0 */6 * * *' (every 6 hours)
// To: '*/1 * * * *' (every minute) for testing
cron.schedule('*/1 * * * *', () => {
  competitionService.evaluateCompetition();
});
```

## 📝 Notes

- **Mock Currency**: x402 is a mock currency for demonstration purposes
- **No Blockchain**: This is a simulation, no real blockchain integration
- **No Real LLM**: Agent actions use deterministic logic based on strategy
- **In-Memory Storage**: Data is lost on server restart (use a database for persistence)

## 🔧 Customization

### Change Competition Interval
Edit `backend/server.js`:
```javascript
cron.schedule('0 */6 * * *', () => { // Change to desired schedule
```

### Change Agent Simulation Frequency
Edit `backend/server.js`:
```javascript
cron.schedule('*/30 * * * * *', () => { // Change interval in seconds
```

### Adjust Agent Behavior
Modify `backend/models/agent.js` to change:
- Starting balance
- Earn/spend amounts
- Score calculation
- Strategy multipliers

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 3001 is available
- Ensure all dependencies are installed (`npm install`)

**Frontend can't connect:**
- Verify backend is running on `http://localhost:3001`
- Check browser console for CORS errors
- Update `API_BASE` in `frontend/app.js` if using different port

**Agents not updating:**
- Check backend console for cron job logs
- Verify agents are in "active" status
- Check server logs for errors

## 📄 License

MIT


