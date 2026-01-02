const { v4: uuidv4 } = require('uuid');

/**
 * Agent Model
 * Represents an autonomous AI agent in the competition
 */
class Agent {
  constructor(owner, strategyType = 'balanced') {
    this.id = uuidv4();
    this.owner = owner;
    this.balance = 1000; // Starting balance in mock x402
    this.strategyType = strategyType; // 'aggressive', 'balanced', 'conservative'
    this.score = 0;
    this.status = 'active';
    this.createdAt = new Date().toISOString();
    this.lastAction = null;
  }

  /**
   * Agent earns mock x402 based on strategy
   * Aggressive: higher variance, higher potential
   * Conservative: lower variance, steady gains
   * Balanced: moderate variance
   */
  earn() {
    let amount;
    const baseEarn = 50;
    
    switch (this.strategyType) {
      case 'aggressive':
        // 20-150 x402 with higher variance
        amount = baseEarn + Math.random() * 130 - 15;
        break;
      case 'conservative':
        // 30-80 x402 with lower variance
        amount = baseEarn + Math.random() * 50 - 10;
        break;
      case 'balanced':
      default:
        // 25-100 x402
        amount = baseEarn + Math.random() * 75 - 25;
        break;
    }
    
    amount = Math.max(10, Math.round(amount)); // Minimum 10
    this.balance += amount;
    this.lastAction = { type: 'earn', amount, timestamp: new Date().toISOString() };
    return amount;
  }

  /**
   * Agent spends mock x402 based on strategy
   * Aggressive: spends more to compete
   * Conservative: spends less, saves more
   * Balanced: moderate spending
   */
  spend() {
    let amount;
    const spendRatio = this.balance * 0.1; // Base 10% of balance
    
    switch (this.strategyType) {
      case 'aggressive':
        // Spends 15-25% of balance
        amount = spendRatio * (1.5 + Math.random() * 0.5);
        break;
      case 'conservative':
        // Spends 5-10% of balance
        amount = spendRatio * (0.5 + Math.random() * 0.5);
        break;
      case 'balanced':
      default:
        // Spends 8-15% of balance
        amount = spendRatio * (0.8 + Math.random() * 0.7);
        break;
    }
    
    amount = Math.min(amount, this.balance); // Can't spend more than balance
    amount = Math.max(0, Math.round(amount));
    this.balance -= amount;
    this.lastAction = { type: 'spend', amount, timestamp: new Date().toISOString() };
    return amount;
  }

  /**
   * Agent competes - generates competition score based on balance and strategy
   * Score is weighted by strategy type and current balance
   */
  compete() {
    const balanceWeight = this.balance / 1000; // Normalize balance
    let strategyMultiplier;
    
    switch (this.strategyType) {
      case 'aggressive':
        strategyMultiplier = 1.3; // Higher risk, higher reward potential
        break;
      case 'conservative':
        strategyMultiplier = 0.9; // Lower risk, steady gains
        break;
      case 'balanced':
      default:
        strategyMultiplier = 1.0;
        break;
    }
    
    // Base score from balance + random competition factor
    const competitionFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
    const points = Math.round(balanceWeight * 100 * strategyMultiplier * competitionFactor);
    
    this.score += points;
    this.lastAction = { type: 'compete', points, timestamp: new Date().toISOString() };
    return points;
  }

  /**
   * Perform all actions in sequence: earn, spend, compete
   */
  act() {
    if (this.status !== 'active') return;
    
    this.earn();
    this.spend();
    this.compete();
  }

  /**
   * Reset score (partial reset - keeps some percentage)
   */
  resetScore(keepPercentage = 0.1) {
    this.score = Math.round(this.score * keepPercentage);
  }
}

module.exports = Agent;


