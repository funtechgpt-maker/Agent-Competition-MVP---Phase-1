const store = require('../store');

/**
 * Competition Service
 * Handles agent simulation and competition evaluation
 */

/**
 * Simulate actions for all active agents
 * Called periodically (every 30 seconds)
 */
function simulateAgentActions() {
  const activeAgents = store.agents.filter(agent => agent.status === 'active');
  
  if (activeAgents.length === 0) {
    return;
  }
  
  console.log(`🔄 Simulating actions for ${activeAgents.length} active agents...`);
  
  activeAgents.forEach(agent => {
    try {
      agent.act();
    } catch (error) {
      console.error(`Error simulating agent ${agent.id}:`, error);
    }
  });
  
  // Log summary
  const totalScore = activeAgents.reduce((sum, agent) => sum + agent.score, 0);
  const avgBalance = activeAgents.reduce((sum, agent) => sum + agent.balance, 0) / activeAgents.length;
  console.log(`📊 Total Score: ${totalScore}, Avg Balance: ${avgBalance.toFixed(2)} x402`);
}

/**
 * Evaluate competition and declare winner
 * Called every 6 hours
 */
function evaluateCompetition() {
  const activeAgents = store.agents.filter(agent => agent.status === 'active');
  
  if (activeAgents.length === 0) {
    console.log('⚠️  No active agents to evaluate');
    return;
  }
  
  console.log(`🏆 Evaluating competition with ${activeAgents.length} agents...`);
  
  // Sort agents by score (descending)
  const rankedAgents = [...activeAgents].sort((a, b) => b.score - a.score);
  
  // Get winner
  const winner = rankedAgents[0];
  
  // Log winner to history
  const winnerEntry = {
    agentId: winner.id,
    owner: winner.owner,
    score: winner.score,
    balance: winner.balance,
    strategyType: winner.strategyType,
    timestamp: new Date().toISOString(),
    totalAgents: activeAgents.length,
  };
  
  store.winners.push(winnerEntry);
  store.lastEvaluation = new Date().toISOString();
  
  // Update next evaluation time (6 hours from now)
  const now = new Date();
  store.nextEvaluation = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  
  console.log(`🎉 Winner declared: Agent ${winner.id.substring(0, 8)}... (Owner: ${winner.owner})`);
  console.log(`   Score: ${winner.score}, Balance: ${winner.balance} x402, Strategy: ${winner.strategyType}`);
  
  // Partial reset scores (keep 10% to maintain some history)
  rankedAgents.forEach(agent => {
    agent.resetScore(0.1);
  });
  
  console.log(`🔄 Scores partially reset (10% retained)`);
}

/**
 * Get leaderboard (top N agents)
 */
function getLeaderboard(limit = 10) {
  const activeAgents = store.agents
    .filter(agent => agent.status === 'active')
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(agent => ({
      id: agent.id,
      owner: agent.owner,
      score: agent.score,
      balance: agent.balance,
      strategyType: agent.strategyType,
      createdAt: agent.createdAt,
    }));
  
  return activeAgents;
}

module.exports = {
  simulateAgentActions,
  evaluateCompetition,
  getLeaderboard,
};


