import { EventTypes } from '../events/EventTypes.js';

export class StateManager {
  constructor(changeApp) {
    this.changeApp = changeApp;
    this.users = new Map();
    this.proposals = new Map();
    this.comments = new Map();
  }

  async initialize() {
    console.log('🗄️ Initializing State Manager...');
    // In a real implementation, this would load from persistent storage.
    // For now, it starts fresh.
    console.log('✅ State Manager initialized');
  }

  async applyEvent(event) {
    console.log(`🔄 Applying event: ${event.type}`);
    switch (event.type) {
      case EventTypes.USER_REGISTER:
        this._handleUserRegister(event);
        break;
      case EventTypes.QUIZ_PASS:
        this._handleQuizPass(event);
        break;
      case EventTypes.QUIZ_FAIL:
        this._handleQuizFail(event);
        break;
      case EventTypes.PROPOSAL_CREATE:
        this._handleProposalCreate(event);
        break;
      case EventTypes.PROPOSAL_VOTE:
        this._handleProposalVote(event);
        break;
      // Add other event handlers here as they are built
      default:
        console.warn(`🤷 Unknown event type: ${event.type}`);
    }
    this.changeApp.emit('stateChange', event);
  }

  _handleUserRegister(event) {
    const { username, cryptoIdentity, referredBy } = event;
    if (!this.users.has(username)) {
      this.users.set(username, {
        username,
        acents: 0,
        dcents: 0,
        quizzesPassed: [],
        quizzesFailed: [],
        votesSubmitted: [], // Initialize votesSubmitted array
        delegations: {},
        referredBy: referredBy || null,
        referrals: [],
        cryptoIdentity
      });
    }
  }

  _handleQuizPass(event) {
    const { username, quizId } = event.data;
    const user = this.users.get(username);
    if (user) {
      user.acents = (user.acents || 0) + 1;
      if (!user.quizzesPassed.includes(quizId)) {
        user.quizzesPassed.push(quizId);
      }
    }
  }

  _handleQuizFail(event) {
    const { username, quizId } = event.data;
    const user = this.users.get(username);
    if (user) {
      user.dcents = (user.dcents || 0) + 1;
      if (!user.quizzesFailed.includes(quizId)) {
        user.quizzesFailed.push(quizId);
      }
    }
  }

  _handleProposalCreate(event) {
    const proposal = event.data;
    this.proposals.set(proposal.id, proposal);
  }
  
  _handleProposalVote(event) {
    const { username, proposalId, vote } = event.data;
    const user = this.users.get(username);
    const proposal = this.proposals.get(proposalId);

    if (user && proposal) {
      // Award ACent for voting
      user.acents = (user.acents || 0) + 1;
      // Record that the user has voted on this proposal
      if (!user.votesSubmitted.includes(proposalId)) {
        user.votesSubmitted.push(proposalId);
      }
      // Update proposal vote counts
      if (proposal.votes[vote] !== undefined) {
        proposal.votes[vote]++;
      }
    }
  }


  // --- State Query Methods ---

  async getUser(username) {
    return this.users.get(username) || null;
  }

  async getProposal(proposalId) {
    return this.proposals.get(proposalId) || null;
  }
  
  async getProposalsByScope(scope) {
    const allProposals = Array.from(this.proposals.values());
    if (scope === 'world') {
      return allProposals;
    }
    return allProposals.filter(p => p.scope === scope || p.isFoundingProposal);
  }

  async getComments(proposalId) {
    const allComments = Array.from(this.comments.values());
    return allComments.filter(c => c.proposalId === proposalId);
  }
  
  async getComment(commentId) {
    return this.comments.get(commentId) || null;
  }

  // Admin/Debug methods
  async deleteUser(username) {
    if (this.users.has(username)) {
      this.users.delete(username);
      console.log(`🗑️ User ${username} deleted from state.`);
      return true;
    }
    return false;
  }
}
