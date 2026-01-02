/**
 * Frontend Application
 * Simple vanilla JS client for AI Agent Competition System
 */

const API_BASE = 'http://localhost:3001/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupDeployForm();
    loadAllData();
    
    // Auto-refresh every 10 seconds
    setInterval(loadAllData, 10000);
});

/**
 * Setup deploy agent form
 */
function setupDeployForm() {
    const form = document.getElementById('deployForm');
    const messageDiv = document.getElementById('deployMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const owner = document.getElementById('owner').value.trim();
        const strategy = document.getElementById('strategy').value;
        
        if (!owner) {
            showMessage('error', 'Please enter an owner ID');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/deploy-agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ owner, strategyType: strategy }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('success', `Agent deployed successfully! ID: ${data.agent.id.substring(0, 8)}...`);
                form.reset();
                loadAllData(); // Refresh all data
            } else {
                showMessage('error', data.error || 'Failed to deploy agent');
            }
        } catch (error) {
            showMessage('error', 'Failed to connect to server. Make sure backend is running.');
            console.error('Deploy error:', error);
        }
    });
}

/**
 * Show message to user
 */
function showMessage(type, text) {
    const messageDiv = document.getElementById('deployMessage');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

/**
 * Load all data (stats, leaderboard, winner, agents)
 */
async function loadAllData() {
    await Promise.all([
        loadStats(),
        loadLeaderboard(),
        loadLastWinner(),
        loadAgents(),
    ]);
}

/**
 * Load competition statistics
 */
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        
        document.getElementById('totalAgents').textContent = data.totalAgents || 0;
        document.getElementById('activeAgents').textContent = data.activeAgents || 0;
        document.getElementById('totalScore').textContent = data.totalScore || 0;
        
        if (data.nextEvaluation) {
            const nextEval = new Date(data.nextEvaluation);
            const now = new Date();
            const diff = nextEval - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('nextEvaluation').textContent = 
                diff > 0 ? `${hours}h ${minutes}m` : 'Soon';
        } else {
            document.getElementById('nextEvaluation').textContent = '-';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load leaderboard
 */
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard?limit=10`);
        const data = await response.json();
        
        const leaderboardDiv = document.getElementById('leaderboard');
        
        if (data.leaderboard.length === 0) {
            leaderboardDiv.innerHTML = '<div class="no-data">No agents in competition yet</div>';
            return;
        }
        
        let html = '<table><thead><tr>';
        html += '<th>Rank</th>';
        html += '<th>Owner</th>';
        html += '<th>Score</th>';
        html += '<th>Balance (x402)</th>';
        html += '<th>Strategy</th>';
        html += '<th>Created</th>';
        html += '</tr></thead><tbody>';
        
        data.leaderboard.forEach((agent, index) => {
            const rank = index + 1;
            const createdDate = new Date(agent.createdAt).toLocaleDateString();
            html += `<tr>`;
            html += `<td>${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</td>`;
            html += `<td>${agent.owner}</td>`;
            html += `<td><strong>${agent.score}</strong></td>`;
            html += `<td>${agent.balance.toFixed(2)}</td>`;
            html += `<td><span class="badge ${agent.strategyType}">${agent.strategyType}</span></td>`;
            html += `<td>${createdDate}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        leaderboardDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard').innerHTML = 
            '<div class="no-data">Error loading leaderboard</div>';
    }
}

/**
 * Load last winner
 */
async function loadLastWinner() {
    try {
        const response = await fetch(`${API_BASE}/last-winner`);
        const data = await response.json();
        
        const winnerDiv = document.getElementById('lastWinner');
        
        if (!data.winner) {
            winnerDiv.innerHTML = '<div class="no-data">No winners yet. Competition has not been evaluated.</div>';
            return;
        }
        
        const winner = data.winner;
        const winnerDate = new Date(winner.timestamp).toLocaleString();
        
        let html = '<div class="winner-card">';
        html += `<h3>🎉 Last Competition Winner</h3>`;
        html += `<p><strong>Owner:</strong> ${winner.owner}</p>`;
        html += `<p><strong>Agent ID:</strong> ${winner.agentId.substring(0, 8)}...</p>`;
        html += `<p><strong>Winning Score:</strong> ${winner.score}</p>`;
        html += `<p><strong>Balance:</strong> ${winner.balance.toFixed(2)} x402</p>`;
        html += `<p><strong>Strategy:</strong> <span class="badge ${winner.strategyType}">${winner.strategyType}</span></p>`;
        html += `<p><strong>Won At:</strong> ${winnerDate}</p>`;
        html += `<p><strong>Total Agents:</strong> ${winner.totalAgents}</p>`;
        
        if (winner.currentStatus) {
            html += `<p><strong>Current Status:</strong> ${winner.currentStatus}</p>`;
            if (winner.currentScore !== null) {
                html += `<p><strong>Current Score:</strong> ${winner.currentScore}</p>`;
            }
        }
        
        html += `<p><em>Total winners in history: ${data.totalWinners}</em></p>`;
        html += '</div>';
        
        winnerDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading last winner:', error);
        document.getElementById('lastWinner').innerHTML = 
            '<div class="no-data">Error loading winner data</div>';
    }
}

/**
 * Load all agents
 */
async function loadAgents() {
    try {
        const response = await fetch(`${API_BASE}/agents`);
        const data = await response.json();
        
        const agentsDiv = document.getElementById('agents');
        
        if (data.agents.length === 0) {
            agentsDiv.innerHTML = '<div class="no-data">No agents deployed yet</div>';
            return;
        }
        
        let html = '<table><thead><tr>';
        html += '<th>Owner</th>';
        html += '<th>Score</th>';
        html += '<th>Balance (x402)</th>';
        html += '<th>Strategy</th>';
        html += '<th>Status</th>';
        html += '<th>Last Action</th>';
        html += '<th>Created</th>';
        html += '</tr></thead><tbody>';
        
        data.agents.forEach(agent => {
            const createdDate = new Date(agent.createdAt).toLocaleDateString();
            const lastAction = agent.lastAction 
                ? `${agent.lastAction.type} (${new Date(agent.lastAction.timestamp).toLocaleTimeString()})`
                : 'None';
            
            html += `<tr>`;
            html += `<td>${agent.owner}</td>`;
            html += `<td><strong>${agent.score}</strong></td>`;
            html += `<td>${agent.balance.toFixed(2)}</td>`;
            html += `<td><span class="badge ${agent.strategyType}">${agent.strategyType}</span></td>`;
            html += `<td>${agent.status}</td>`;
            html += `<td>${lastAction}</td>`;
            html += `<td>${createdDate}</td>`;
            html += `</tr>`;
        });
        
        html += '</tbody></table>';
        agentsDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading agents:', error);
        document.getElementById('agents').innerHTML = 
            '<div class="no-data">Error loading agents</div>';
    }
}


