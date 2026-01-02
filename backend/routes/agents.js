const express = require('express');
const router = express.Router();
const Agent = require('../models/agent');
const store = require('../store');
const competitionService = require('../services/competition');

/**
 * POST /api/deploy-agent
 * Deploy a new agent
 * Body: { owner: string, strategyType: 'aggressive' | 'balanced' | 'conservative' }
 */
router.post('/deploy-agent', (req, res) => {
  try {
    const { owner, strategyType = 'balanced' } = req.body;
    
    if (!owner) {
      return res.status(400).json({ error: 'Owner is required' });
    }
    
    const validStrategies = ['aggressive', 'balanced', 'conservative'];
    if (!validStrategies.includes(strategyType)) {
      return res.status(400).json({ error: `Strategy must be one of: ${validStrategies.join(', ')}` });
    }
    
    // Mock deployment fee (deducted from starting balance)
    const deploymentFee = 100; // mock x402
    
    // Create new agent
    const agent = new Agent(owner, strategyType);
    agent.balance -= deploymentFee; // Deduct deployment fee
    
    // Add to store
    store.agents.push(agent);
    
    console.log(`✅ Agent deployed: ${agent.id.substring(0, 8)}... (Owner: ${owner}, Strategy: ${strategyType})`);
    
    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        owner: agent.owner,
        balance: agent.balance,
        strategyType: agent.strategyType,
        score: agent.score,
        status: agent.status,
        createdAt: agent.createdAt,
      },
      message: 'Agent deployed successfully',
    });
  } catch (error) {
    console.error('Error deploying agent:', error);
    res.status(500).json({ error: 'Failed to deploy agent' });
  }
});

/**
 * GET /api/agents
 * Get all agents (or filter by owner)
 * Query params: ?owner=userId
 */
router.get('/agents', (req, res) => {
  try {
    const { owner } = req.query;
    
    let agents = store.agents;
    
    if (owner) {
      agents = agents.filter(agent => agent.owner === owner);
    }
    
    // Return agent data without internal methods
    const agentData = agents.map(agent => ({
      id: agent.id,
      owner: agent.owner,
      balance: agent.balance,
      strategyType: agent.strategyType,
      score: agent.score,
      status: agent.status,
      createdAt: agent.createdAt,
      lastAction: agent.lastAction,
    }));
    
    res.json({
      agents: agentData,
      count: agentData.length,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * GET /api/leaderboard
 * Get leaderboard (top agents by score)
 * Query params: ?limit=10
 */
router.get('/leaderboard', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = competitionService.getLeaderboard(limit);
    
    res.json({
      leaderboard,
      count: leaderboard.length,
      lastEvaluation: store.lastEvaluation,
      nextEvaluation: store.nextEvaluation,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/last-winner
 * Get the last competition winner
 */
router.get('/last-winner', (req, res) => {
  try {
    if (store.winners.length === 0) {
      return res.json({
        winner: null,
        message: 'No winners yet. Competition has not been evaluated.',
      });
    }
    
    const lastWinner = store.winners[store.winners.length - 1];
    
    // Get full agent details if still active
    const agent = store.agents.find(a => a.id === lastWinner.agentId);
    
    res.json({
      winner: {
        ...lastWinner,
        currentStatus: agent ? agent.status : 'inactive',
        currentScore: agent ? agent.score : null,
        currentBalance: agent ? agent.balance : null,
      },
      totalWinners: store.winners.length,
    });
  } catch (error) {
    console.error('Error fetching last winner:', error);
    res.status(500).json({ error: 'Failed to fetch last winner' });
  }
});

/**
 * GET /api/stats
 * Get competition statistics
 */
router.get('/stats', (req, res) => {
  try {
    const activeAgents = store.agents.filter(agent => agent.status === 'active');
    const totalScore = activeAgents.reduce((sum, agent) => sum + agent.score, 0);
    const totalBalance = activeAgents.reduce((sum, agent) => sum + agent.balance, 0);
    
    res.json({
      totalAgents: store.agents.length,
      activeAgents: activeAgents.length,
      totalScore,
      totalBalance,
      averageScore: activeAgents.length > 0 ? totalScore / activeAgents.length : 0,
      averageBalance: activeAgents.length > 0 ? totalBalance / activeAgents.length : 0,
      lastEvaluation: store.lastEvaluation,
      nextEvaluation: store.nextEvaluation,
      totalWinners: store.winners.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;


