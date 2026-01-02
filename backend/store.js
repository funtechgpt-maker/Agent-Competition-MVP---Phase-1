/**
 * In-memory data store for agents and competition history
 * In production, this would be replaced with a proper database
 */

const store = {
  agents: [],
  winners: [], // History of winners
  lastEvaluation: null,
  nextEvaluation: null,
};

/**
 * Initialize next evaluation time (6 hours from now)
 */
function initializeNextEvaluation() {
  const now = new Date();
  const next = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
  store.nextEvaluation = next;
}

// Initialize on first load
initializeNextEvaluation();

module.exports = store;


