import Autobase from 'autobase'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import Hyperbee from 'hyperbee'
import RAM from 'random-access-memory'
import { EventEmitter } from 'events'
import crypto from 'crypto'

import { EventTypes } from '../events/EventTypes.js'
import { StateManager } from '../state/StateManager.js'
import { FoundingProposal } from '../data/FoundingProposal.js'

export class ChangeApp extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.options = {
      storage: options.storage || RAM,
      bootstrap: options.bootstrap || [],
      ...options
    }
    
    this.corestore = null
    this.autobase = null
    this.bee = null
    this.swarm = null
    this.stateManager = null
    this.ready = false
  }

  async initialize() {
    try {
      console.log('🚀 Initializing The Change App...')
      
      // For now, use simplified in-memory storage to get the system working
      // We'll add full Autobase integration once the core logic is tested
      this.storage = new Map()
      this.eventLog = []
      
      // Set ready flag before initializing other components
      this.ready = true
      
      // Initialize State Manager with simplified storage
      this.stateManager = new StateManager(this)
      await this.stateManager.initialize()
      
      // Initialize P2P networking (simplified)
      await this._initializeNetworking()
      
      // Initialize founding proposal if first run
      await this._initializeFoundingProposal()
      
      // Initialize tutorial quiz
      await this._initializeTutorialQuiz()
      
      // Initialize founding proposal quiz
      await this._initializeFoundingProposalQuiz()
      
      console.log('✅ The Change App initialized successfully!')
      this.emit('ready')
      
    } catch (error) {
      console.error('❌ Failed to initialize The Change App:', error)
      throw error
    }
  }

  async _initializeNetworking() {
    // Simplified networking for initial testing
    console.log('📡 P2P networking initialized (simplified mode)')
  }

  async _initializeFoundingProposal() {
    // Check if founding proposal already exists
    const existingProposal = await this.stateManager.getProposal('FOUNDING_PROPOSAL_PROTECTED')
    
    if (!existingProposal) {
      console.log('📜 Creating founding proposal: Digital Bill of Rights')
      
      // Create the founding proposal event
      const foundingEvent = {
        type: EventTypes.PROPOSAL_CREATE,
        timestamp: Date.now(),
        data: {
          id: 'FOUNDING_PROPOSAL_PROTECTED',
          title: 'Establish a Digital Bill of Rights for All Citizens',
          content: FoundingProposal.content,
          author: 'TAObaeus Rushaeus',
          scope: 'world',
          isProtected: true,
          isFoundingProposal: true,
          version: 1,
          acentsBalance: 0,
          upvotes: 0,
          votes: { for: 0, against: 0, abstain: 0 }
        }
      }
      
      await this._appendEvent(foundingEvent)
    }
  }

  async _initializeTutorialQuiz() {
    // Check if tutorial quiz already exists
    const existingQuiz = this.storage.get('quiz_tutorial')
    
    if (!existingQuiz) {
      console.log('📚 Creating tutorial quiz...')
      
      const tutorialQuestions = [
        {
          question: "What are the two types of tokens in The Change App?",
          options: [
            "A) ACents (competence) and DCents (delegation)",
            "B) Bitcoin and Ethereum", 
            "C) Votes and Comments",
            "D) Likes and Shares"
          ],
          correct: "A"
        },
        {
          question: "What percentage score is required to pass a competence quiz?",
          options: [
            "A) 50%",
            "B) 60%", 
            "C) 75%",
            "D) 90%"
          ],
          correct: "C"
        },
        {
          question: "What happens when a comment gets as many upvotes as the proposal?",
          options: [
            "A) Nothing special",
            "B) It gets deleted",
            "C) It automatically integrates into the proposal", 
            "D) The author gets banned"
          ],
          correct: "C"
        },
        {
          question: "How many ACents does it cost to submit a proposal?",
          options: [
            "A) 1 ACent",
            "B) 2 ACents",
            "C) 3 ACents",
            "D) 5 ACents"
          ],
          correct: "C"
        }
      ]
      
      // Store tutorial quiz
      this.storage.set('quiz_tutorial', {
        id: 'tutorial',
        proposalId: 'tutorial',
        questions: tutorialQuestions,
        createdAt: Date.now()
      })
      
      console.log('✅ Tutorial quiz initialized')
    }
  }

  async _initializeFoundingProposalQuiz() {
    // Check if founding proposal quiz already exists
    const existingQuiz = this.storage.get('quiz_FOUNDING_PROPOSAL_PROTECTED')
    
    if (!existingQuiz) {
      console.log('📜 Creating founding proposal quiz...')
      
      const foundingQuestions = [
        {
          question: "What is the primary purpose of the Digital Bill of Rights?",
          options: [
            "A) To regulate internet usage",
            "B) To establish a new social contract for the digital world",
            "C) To create a new cryptocurrency",
            "D) To replace existing governments"
          ],
          correct: "B"
        },
        {
          question: "According to Article 2, what right does every user retain?",
          options: [
            "A) The right to unlimited data",
            "B) The right to free internet access", 
            "C) The right to human review of algorithmic decisions",
            "D) The right to delete any content"
          ],
          correct: "C"
        },
        {
          question: "What does Article 5 declare about our data?",
          options: [
            "A) Data belongs to the government",
            "B) Data should be free for everyone",
            "C) Our data is our property and its terms of use are ours to set",
            "D) Data should be stored permanently"
          ],
          correct: "C"
        },
        {
          question: "What is required to vote on this proposal?",
          options: [
            "A) Nothing special",
            "B) Passing a competence quiz on the topic",
            "C) Being the proposal author", 
            "D) Having 10 ACents"
          ],
          correct: "B"
        },
        {
          question: "What does Article 7 ban?",
          options: [
            "A) All forms of photography",
            "B) Social media platforms",
            "C) Covert biometrics like facial recognition without community consent",
            "D) Online shopping"
          ],
          correct: "C"
        }
      ]
      
      // Store founding proposal quiz
      this.storage.set('quiz_FOUNDING_PROPOSAL_PROTECTED', {
        id: 'FOUNDING_PROPOSAL_PROTECTED',
        proposalId: 'FOUNDING_PROPOSAL_PROTECTED',
        questions: foundingQuestions,
        createdAt: Date.now()
      })
      
      console.log('✅ Founding proposal quiz initialized')
    }
  }

  async _appendEvent(event) {
    if (!this.ready) {
      throw new Error('ChangeApp not ready. Call initialize() first.')
    }
    
    // Add event metadata
    event.id = crypto.randomUUID()
    event.timestamp = event.timestamp || Date.now()
    
    // Store in simplified event log
    this.eventLog.push(event)
    
    // Apply to state manager
    await this.stateManager.applyEvent(event)
    
    console.log(`📝 Event appended: ${event.type}`, event.id)
    this.emit('event', event)
    
    return event
  }

  // User Management
  async registerUser(username) {
    const event = {
      type: EventTypes.USER_REGISTER,
      data: {
        username,
        acents: 0,
        dcents: 0,
        quizzesPassed: [],
        quizzesFailed: [],
        delegations: {},
        referredBy: null,
        referrals: []
      }
    }
    
    return await this._appendEvent(event)
  }

  async attemptQuiz(username, quizId, answers, passed) {
    const eventType = passed ? EventTypes.QUIZ_PASS : EventTypes.QUIZ_FAIL
    const tokenReward = passed ? { acents: 1 } : { dcents: 1 }
    
    const event = {
      type: eventType,
      data: {
        username,
        quizId,
        answers,
        passed,
        ...tokenReward
      }
    }
    
    return await this._appendEvent(event)
  }

  // Proposal Management
  async createProposal(username, title, content, scope = 'neighborhood') {
    // Check if user has 3 ACents
    const user = await this.stateManager.getUser(username)
    if (!user || user.acents < 3) {
      throw new Error('Insufficient ACents. Need 3 ACents to create a proposal.')
    }
    
    const proposalId = crypto.randomUUID()
    
    const event = {
      type: EventTypes.PROPOSAL_CREATE,
      data: {
        id: proposalId,
        title,
        content,
        author: username,
        scope,
        isProtected: false,
        isFoundingProposal: false,
        version: 1,
        acentsBalance: 0,
        upvotes: 0,
        votes: { for: 0, against: 0, abstain: 0 },
        cost: 3 // ACents deducted from author
      }
    }
    
    return await this._appendEvent(event)
  }

  async voteOnProposal(username, proposalId, vote, isDelegated = false, delegator = null) {
    const event = {
      type: EventTypes.PROPOSAL_VOTE,
      data: {
        username,
        proposalId,
        vote, // 'for', 'against', 'abstain'
        isDelegated,
        delegator,
        acentReward: 1 // Voters earn 1 ACent regardless of vote direction
      }
    }
    
    return await this._appendEvent(event)
  }

  async upvoteProposal(username, proposalId) {
    const event = {
      type: EventTypes.PROPOSAL_UPVOTE,
      data: {
        username,
        proposalId,
        acentToProposal: 1 // 1 ACent goes to proposal's escrow
      }
    }
    
    return await this._appendEvent(event)
  }

  // Comment System
  async createComment(username, proposalId, content) {
    // Check if user passed quiz for this proposal or has DCents to spend
    const user = await this.stateManager.getUser(username)
    const proposal = await this.stateManager.getProposal(proposalId)
    
    const hasPassedQuiz = user.quizzesPassed.includes(`${proposalId}_quiz`)
    const cost = hasPassedQuiz ? 0 : 3 // 3 DCents for non-quiz-passers
    
    if (!hasPassedQuiz && user.dcents < cost) {
      throw new Error('Insufficient DCents. Need 3 DCents to comment without passing quiz.')
    }
    
    const commentId = crypto.randomUUID()
    
    const event = {
      type: EventTypes.COMMENT_CREATE,
      data: {
        id: commentId,
        proposalId,
        author: username,
        content,
        upvotes: 0,
        downvotes: 0,
        dcentValue: 0,
        isIntegrated: false,
        cost
      }
    }
    
    return await this._appendEvent(event)
  }

  async voteOnComment(username, commentId, vote) {
    const event = {
      type: EventTypes.COMMENT_VOTE,
      data: {
        username,
        commentId,
        vote, // 'up' or 'down'
        dcentReward: 1 // Voter earns 1 DCent
      }
    }
    
    return await this._appendEvent(event)
  }

  // Delegation System
  async setDelegation(username, delegate, proposalId = null) {
    const event = {
      type: EventTypes.DELEGATION_SET,
      data: {
        username,
        delegate,
        proposalId, // null for general delegation, specific for proposal delegation
        timestamp: Date.now()
      }
    }
    
    return await this._appendEvent(event)
  }

  async revokeDelegation(username, proposalId = null) {
    const event = {
      type: EventTypes.DELEGATION_REVOKE,
      data: {
        username,
        proposalId,
        timestamp: Date.now()
      }
    }
    
    return await this._appendEvent(event)
  }

  // User Management
  async registerUser(username, referredBy = null, cryptoIdentity = null) {
    const event = {
      type: EventTypes.USER_REGISTER,
      username,
      referredBy,
      cryptoIdentity, // { publicKey }
      timestamp: Date.now()
    }
    
    return await this._appendEvent(event)
  }

  // Token Transfers
  async transferACents(from, to, amount) {
    const event = {
      type: EventTypes.ACENT_TRANSFER,
      data: {
        from,
        to,
        amount,
        timestamp: Date.now()
      }
    }
    
    return await this._appendEvent(event)
  }

  async transferDCents(from, to, amount) {
    const event = {
      type: EventTypes.DCENT_TRANSFER,
      data: {
        from,
        to,
        amount,
        timestamp: Date.now()
      }
    }
    
    return await this._appendEvent(event)
  }

  // State Queries
  async getUser(username) {
    return await this.stateManager.getUser(username)
  }

  async getProposal(proposalId) {
    return await this.stateManager.getProposal(proposalId)
  }

  async getProposalsByScope(scope) {
    return await this.stateManager.getProposalsByScope(scope)
  }

  async getComments(proposalId) {
    return await this.stateManager.getComments(proposalId)
  }

  // Admin/Debug methods
  async deleteUser(username) {
    return await this.stateManager.deleteUser(username)
  }

  async close() {
    console.log('👋 The Change App closed')
  }
}

