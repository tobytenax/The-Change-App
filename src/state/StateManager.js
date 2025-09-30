import { EventTypes } from '../events/EventTypes.js'

/**
 * StateManager handles all state transitions based on events
 * This is where the economic rules and governance logic are implemented
 */
export class StateManager {
  constructor(changeApp) {
    this.changeApp = changeApp // Reference to main ChangeApp instance
    this.cache = new Map() // In-memory cache for performance
  }

  async initialize() {
    console.log('🗄️ Initializing State Manager...')
    
    // Initialize state collections in simplified storage
    this.changeApp.storage.set('users', new Map())
    this.changeApp.storage.set('proposals', new Map())
    this.changeApp.storage.set('comments', new Map())
    this.changeApp.storage.set('delegations', new Map())
    this.changeApp.storage.set('escrows', new Map())
    this.changeApp.storage.set('implementations', new Map())
    
    console.log('✅ State Manager initialized')
  }

  /**
   * Apply an event to the state - this is the core consensus function
   */
  async applyEvent(event) {
    console.log(`🔄 Applying event: ${event.type}`)
    
    try {
      switch (event.type) {
        case EventTypes.USER_REGISTER:
          await this._handleUserRegister(event)
          break
          
        case EventTypes.QUIZ_PASS:
          await this._handleQuizPass(event)
          break
          
        case EventTypes.QUIZ_FAIL:
          await this._handleQuizFail(event)
          break
          
        case EventTypes.PROPOSAL_CREATE:
          await this._handleProposalCreate(event)
          break
          
        case EventTypes.PROPOSAL_VOTE:
          await this._handleProposalVote(event)
          break
          
        case EventTypes.PROPOSAL_UPVOTE:
          await this._handleProposalUpvote(event)
          break
          
        case EventTypes.COMMENT_CREATE:
          await this._handleCommentCreate(event)
          break
          
        case EventTypes.COMMENT_VOTE:
          await this._handleCommentVote(event)
          break
          
        case EventTypes.DELEGATION_SET:
          await this._handleDelegationSet(event)
          break
          
        case EventTypes.DELEGATION_REVOKE:
          await this._handleDelegationRevoke(event)
          break
          
        case EventTypes.ACENT_TRANSFER:
          await this._handleAcentTransfer(event)
          break
          
        case EventTypes.DCENT_TRANSFER:
          await this._handleDcentTransfer(event)
          break
          
        default:
          console.warn(`⚠️ Unhandled event type: ${event.type}`)
      }
      
      // Clear cache for affected entities
      this._invalidateCache(event)
      
    } catch (error) {
      console.error(`❌ Error applying event ${event.type}:`, error)
      throw error
    }
  }

  async _handleUserRegister(event) {
    const { username, referredBy, cryptoIdentity } = event
    
    const user = {
      username,
      acents: 0,
      dcents: 0,
      quizzesPassed: [],
      quizzesFailed: [],
      delegations: {},
      referredBy: referredBy || null,
      referrals: [],
      cryptoIdentity: cryptoIdentity || null, // Store public key and crypto info
      createdAt: event.timestamp,
      lastActive: event.timestamp
    }
    
    await this._saveUser(user)
    
    // If referred by someone, add to their referrals and award ACent immediately
    if (referredBy) {
      const referrer = await this.getUser(referredBy)
      if (referrer) {
        referrer.referrals.push(username)
        referrer.acents += 1 // Referral bonus awarded immediately
        await this._saveUser(referrer)
      }
    }
  }

  async _handleQuizPass(event) {
    const { username, quizId, acents = 1 } = event.data
    
    const user = await this.getUser(username)
    if (!user) throw new Error(`User ${username} not found`)
    
    // Award ACents to user
    user.acents += acents
    user.quizzesPassed.push({
      quizId,
      timestamp: event.timestamp,
      acentsEarned: acents
    })
    
    await this._saveUser(user)
  }

  async _handleQuizFail(event) {
    const { username, quizId, dcents = 1 } = event.data
    const user = await this.getUser(username)
    
    if (user) {
      user.dcents += dcents
      user.quizzesFailed.push(quizId)
      user.lastActive = event.timestamp
      await this._saveUser(user)
    }
  }

  async _handleProposalCreate(event) {
    const { id, title, content, author, scope, cost = 3 } = event.data
    
    // Deduct ACents from author
    const authorUser = await this.getUser(author)
    if (authorUser && authorUser.acents >= cost) {
      authorUser.acents -= cost
      await this._saveUser(authorUser)
    }
    
    const proposal = {
      id,
      title,
      content,
      author,
      scope,
      isProtected: event.data.isProtected || false,
      isFoundingProposal: event.data.isFoundingProposal || false,
      version: 1,
      acentsBalance: 0,
      upvotes: 0,
      votes: { for: 0, against: 0, abstain: 0 },
      voters: [],
      comments: [],
      integratedComments: [],
      createdAt: event.timestamp,
      lastModified: event.timestamp
    }
    
    await this._saveProposal(proposal)
  }

  async _handleProposalVote(event) {
    const { username, proposalId, vote, isDelegated = false, delegator = null, acentReward = 1 } = event.data
    
    const proposal = await this.getProposal(proposalId)
    const voter = await this.getUser(username)
    
    if (proposal && voter) {
      // Record the vote
      proposal.votes[vote]++
      proposal.voters.push({
        username,
        vote,
        isDelegated,
        delegator,
        timestamp: event.timestamp
      })
      
      // Reward voter with ACent
      voter.acents += acentReward
      voter.lastActive = event.timestamp
      
      // If delegated vote, split the reward
      if (isDelegated && delegator) {
        const delegatorUser = await this.getUser(delegator)
        if (delegatorUser) {
          voter.acents -= 0.5 // Voter gets 0.5
          delegatorUser.acents += 0.5 // Delegator gets 0.5
          await this._saveUser(delegatorUser)
        }
      }
      
      await this._saveProposal(proposal)
      await this._saveUser(voter)
      
      // Check if proposal should scale up geographically
      await this._checkGeographicScaling(proposal)
    }
  }

  async _handleProposalUpvote(event) {
    const { username, proposalId, acentToProposal = 1 } = event.data
    
    const proposal = await this.getProposal(proposalId)
    
    if (proposal) {
      proposal.upvotes++
      proposal.acentsBalance += acentToProposal
      proposal.lastModified = event.timestamp
      
      await this._saveProposal(proposal)
      
      // Check for comment auto-integration
      await this._checkCommentIntegration(proposal)
    }
  }

  async _handleCommentCreate(event) {
    const { id, proposalId, author, content, cost = 0 } = event.data
    
    // Deduct DCents if required
    if (cost > 0) {
      const user = await this.getUser(author)
      if (user && user.dcents >= cost) {
        user.dcents -= cost
        await this._saveUser(user)
      }
    }
    
    const comment = {
      id,
      proposalId,
      author,
      content,
      upvotes: 0,
      downvotes: 0,
      dcentValue: 0,
      isIntegrated: false,
      voters: [],
      createdAt: event.timestamp
    }
    
    await this._saveComment(comment)
    
    // Add comment to proposal
    const proposal = await this.getProposal(proposalId)
    if (proposal) {
      proposal.comments.push(id)
      await this._saveProposal(proposal)
    }
  }

  async _handleCommentVote(event) {
    const { username, commentId, vote, dcentReward = 1 } = event.data
    
    const comment = await this.getComment(commentId)
    const voter = await this.getUser(username)
    
    if (comment && voter) {
      // Record vote
      if (vote === 'up') {
        comment.upvotes++
        comment.dcentValue++
      } else if (vote === 'down') {
        comment.downvotes++
      }
      
      comment.voters.push({
        username,
        vote,
        timestamp: event.timestamp
      })
      
      // Reward voter with DCent
      voter.dcents += dcentReward
      voter.lastActive = event.timestamp
      
      await this._saveComment(comment)
      await this._saveUser(voter)
      
      // Check for auto-integration
      const proposal = await this.getProposal(comment.proposalId)
      if (proposal && comment.upvotes >= proposal.upvotes && proposal.scope !== 'neighborhood') {
        await this._integrateComment(comment, proposal, true) // auto-integration
      }
    }
  }

  async _handleDelegationSet(event) {
    const { username, delegate, proposalId = null } = event.data
    
    const delegation = {
      delegator: username,
      delegate,
      proposalId,
      active: true,
      createdAt: event.timestamp
    }
    
    await this._saveDelegation(delegation)
    
    // Update user's delegation record
    const user = await this.getUser(username)
    if (user) {
      const key = proposalId || 'general'
      user.delegations[key] = delegate
      await this._saveUser(user)
    }
  }

  async _handleDelegationRevoke(event) {
    const { username, proposalId = null } = event.data
    
    const user = await this.getUser(username)
    if (user) {
      const key = proposalId || 'general'
      delete user.delegations[key]
      await this._saveUser(user)
    }
  }

  async _handleAcentTransfer(event) {
    const { from, to, amount } = event.data
    
    const fromUser = await this.getUser(from)
    const toUser = await this.getUser(to)
    
    if (fromUser && toUser && fromUser.acents >= amount) {
      fromUser.acents -= amount
      toUser.acents += amount
      
      await this._saveUser(fromUser)
      await this._saveUser(toUser)
    }
  }

  async _handleDcentTransfer(event) {
    const { from, to, amount } = event.data
    
    const fromUser = await this.getUser(from)
    const toUser = await this.getUser(to)
    
    if (fromUser && toUser && fromUser.dcents >= amount) {
      fromUser.dcents -= amount
      toUser.dcents += amount
      
      await this._saveUser(fromUser)
      await this._saveUser(toUser)
    }
  }

  async _checkGeographicScaling(proposal) {
    // Geographic scaling thresholds from knowledge base
    const thresholds = {
      neighborhood: { mvc: 15, mps: 50 },
      city: { mvc: 150, mps: 750 },
      state: { mvc: 1500, mps: 15000 },
      country: { mvc: 15000, mps: 150000 },
      continent: { mvc: 75000, mps: 1000000 },
      world: { mvc: 150000, mps: 5000000 }
    }
    
    const scaleOrder = ['neighborhood', 'city', 'state', 'country', 'continent', 'world']
    const currentIndex = scaleOrder.indexOf(proposal.scope)
    
    if (currentIndex < scaleOrder.length - 1) {
      const nextScope = scaleOrder[currentIndex + 1]
      const threshold = thresholds[nextScope]
      
      const forVotes = proposal.votes.for
      const totalVoters = proposal.voters.length
      
      if (forVotes >= threshold.mvc && totalVoters >= threshold.mps) {
        proposal.scope = nextScope
        console.log(`🚀 Proposal ${proposal.id} scaled up to ${nextScope}`)
        await this._saveProposal(proposal)
      }
    }
  }

  async _checkCommentIntegration(proposal) {
    // Check all comments for auto-integration threshold
    for (const commentId of proposal.comments) {
      const comment = await this.getComment(commentId)
      if (comment && !comment.isIntegrated && 
          comment.upvotes >= proposal.upvotes && 
          proposal.scope !== 'neighborhood') {
        await this._integrateComment(comment, proposal, true)
      }
    }
  }

  async _integrateComment(comment, proposal, isAutomatic = false) {
    // Mark comment as integrated
    comment.isIntegrated = true
    comment.integrationTimestamp = Date.now()
    comment.integrationMethod = isAutomatic ? 'automatic' : 'manual'
    
    // Add to proposal's integrated comments
    proposal.integratedComments.push(comment.id)
    proposal.version++
    
    // Update proposal content (append comment)
    proposal.content += `\n\n**Community Integration v${proposal.version}:**\n${comment.content}\n*- Integrated from comment by ${comment.author}*`
    
    await this._saveComment(comment)
    await this._saveProposal(proposal)
    
    console.log(`📝 Comment ${comment.id} integrated into proposal ${proposal.id}`)
  }

  // Storage methods
  async _saveUser(user) {
    this.changeApp.storage.get('users').set(user.username, user)
    this.cache.set(`user:${user.username}`, user)
  }

  async _saveProposal(proposal) {
    this.changeApp.storage.get('proposals').set(proposal.id, proposal)
    this.cache.set(`proposal:${proposal.id}`, proposal)
  }

  async _saveComment(comment) {
    this.changeApp.storage.get('comments').set(comment.id, comment)
    this.cache.set(`comment:${comment.id}`, comment)
  }

  async _saveDelegation(delegation) {
    const key = `${delegation.delegator}:${delegation.proposalId || 'general'}`
    this.changeApp.storage.get('delegations').set(key, delegation)
  }

  // Query methods
  async getUser(username) {
    const cacheKey = `user:${username}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const user = this.changeApp.storage.get('users').get(username)
    if (user) {
      this.cache.set(cacheKey, user)
      return user
    }
    return null
  }

  async getProposal(proposalId) {
    const cacheKey = `proposal:${proposalId}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const proposal = this.changeApp.storage.get('proposals').get(proposalId)
    if (proposal) {
      this.cache.set(cacheKey, proposal)
      return proposal
    }
    return null
  }

  async getComment(commentId) {
    const cacheKey = `comment:${commentId}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    const comment = this.changeApp.storage.get('comments').get(commentId)
    if (comment) {
      this.cache.set(cacheKey, comment)
      return comment
    }
    return null
  }

  async getProposalsByScope(scope) {
    const proposals = []
    const proposalsMap = this.changeApp.storage.get('proposals')
    
    for (const [id, proposal] of proposalsMap) {
      // Show proposals that match the scope OR are world-scoped (visible everywhere)
      if (proposal.scope === scope || proposal.scope === 'world') {
        proposals.push(proposal)
      }
    }
    
    return proposals.sort((a, b) => b.lastModified - a.lastModified)
  }

  async getComments(proposalId) {
    const comments = []
    const commentsMap = this.changeApp.storage.get('comments')
    
    for (const [id, comment] of commentsMap) {
      if (comment.proposalId === proposalId) {
        comments.push(comment)
      }
    }
    
    return comments.sort((a, b) => a.createdAt - b.createdAt)
  }

  // Admin/Debug methods
  async deleteUser(username) {
    // Remove from storage
    this.changeApp.storage.get('users').delete(username)
    // Remove from cache
    this.cache.delete(`user:${username}`)
    console.log(`🗑️ Deleted user: ${username}`)
  }

  _invalidateCache(event) {
    // Clear relevant cache entries based on event type
    // Handle both direct properties and nested data properties
    const username = event.username || event.data?.username
    const proposalId = event.proposalId || event.data?.proposalId
    const commentId = event.commentId || event.data?.commentId
    
    if (username) {
      this.cache.delete(`user:${username}`)
    }
    if (proposalId) {
      this.cache.delete(`proposal:${proposalId}`)
    }
    if (commentId) {
      this.cache.delete(`comment:${commentId}`)
    }
  }
}

