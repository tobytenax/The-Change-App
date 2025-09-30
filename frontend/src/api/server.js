import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { CompetenceAI } from '../ai/CompetenceAI.js'

/**
 * Create Express API server for The Change App
 */
export async function createAPIServer(changeApp) {
  const app = express()
  const server = createServer(app)
  
  // Initialize AI service
  const competenceAI = new CompetenceAI()
  
  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true
  }))
  app.use(express.json())
  app.use(express.static('frontend/dist'))
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server })
  const clients = new Set()
  
  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log('📱 New WebSocket client connected')
    
    ws.on('close', () => {
      clients.delete(ws)
      console.log('📱 WebSocket client disconnected')
    })
  })
  
  // Broadcast state changes to all connected clients
  changeApp.on('stateChange', (event) => {
    const message = JSON.stringify({ type: 'stateChange', event })
    clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  })
  
  // API Routes
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      ready: changeApp.ready,
      timestamp: Date.now()
    })
  })
  
  // User Management
  app.post('/api/users/register', async (req, res) => {
    try {
      const { username, publicKey, referredBy } = req.body
      
      if (!username || !publicKey) {
        return res.status(400).json({ error: 'Username and public key are required' })
      }
      
      // Validate username format (basic validation)
      if (!/^[a-zA-Z0-9_\- ]{3,20}$/.test(username)) {
        return res.status(400).json({ 
          error: 'Username must be 3-20 characters, letters, numbers, underscore, dash, or space only' 
        })
      }
      
      // Check if user already exists
      const existingUser = await changeApp.getUser(username)
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' })
      }
      
      // Register user with cryptographic identity
      const event = await changeApp.registerUser(username, referredBy, { publicKey })
      const user = await changeApp.getUser(username)
      
      res.json({ 
        success: true, 
        user,
        event,
        message: 'Registration successful! Welcome to The Change App.' 
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/api/users/:username', async (req, res) => {
    try {
      const user = await changeApp.getUser(req.params.username)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      res.json(user)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  app.delete('/api/users/:username', async (req, res) => {
    try {
      const user = await changeApp.getUser(req.params.username)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      await changeApp.deleteUser(req.params.username)
      res.json({ success: true, message: `User ${req.params.username} deleted successfully` })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Quiz System
  app.post('/api/quiz/attempt', async (req, res) => {
    try {
      const { username, quizId, answers } = req.body
      
      // Get quiz questions (this would be stored when quiz was generated)
      const quiz = await getQuizById(changeApp, quizId)
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' })
      }
      
      // Calculate score
      const score = calculateScore(answers, quiz.questions.map(q => q.correct))
      const passed = score >= 0.75 // 75% threshold
      
      const event = await changeApp.attemptQuiz(username, quizId, answers, passed)
      const user = await changeApp.getUser(username)
      
      res.json({ 
        success: true, 
        passed, 
        score, 
        user,
        event 
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Generate quiz for proposal
  app.post('/api/quiz/generate', async (req, res) => {
    try {
      const { proposalId, authorSuggestions = [] } = req.body
      
      // Special case for tutorial quiz
      if (proposalId === 'tutorial') {
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
        changeApp.storage.set('quiz_tutorial', {
          id: 'tutorial',
          proposalId: 'tutorial',
          questions: tutorialQuestions,
          createdAt: Date.now()
        })
        
        res.json({ 
          success: true, 
          quizId: 'tutorial',
          questions: tutorialQuestions.map(q => ({
            question: q.question,
            options: q.options
            // Don't send correct answers to client
          }))
        })
        return
      }
      
      // Special case for founding proposal quiz
      if (proposalId === 'FOUNDING_PROPOSAL_PROTECTED') {
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
        const quizId = 'FOUNDING_PROPOSAL_PROTECTED'
        changeApp.storage.set(`quiz_${quizId}`, {
          id: quizId,
          proposalId: 'FOUNDING_PROPOSAL_PROTECTED',
          questions: foundingQuestions,
          createdAt: Date.now()
        })
        
        res.json({ 
          success: true, 
          quizId,
          questions: foundingQuestions.map(q => ({
            question: q.question,
            options: q.options
            // Don't send correct answers to client
          }))
        })
        return
      }
      
      const proposal = await changeApp.getProposal(proposalId)
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' })
      }
      
      // Use dolphin-mistral-7b-v2.8 to generate quiz
      const questions = await competenceAI.generateQuiz(proposal, authorSuggestions)
      
      // Store quiz (simplified storage for now)
      const quizId = `${proposalId}_quiz`
      changeApp.storage.set(`quiz_${quizId}`, {
        id: quizId,
        proposalId,
        questions,
        createdAt: Date.now()
      })
      
      res.json({ 
        success: true, 
        quizId,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options
          // Don't send correct answers to client
        }))
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Subjective evaluation for failed quiz
  app.post('/api/quiz/subjective', async (req, res) => {
    try {
      const { username, quizId, essay } = req.body
      
      const quiz = await getQuizById(changeApp, quizId)
      const proposal = await changeApp.getProposal(quiz.proposalId)
      
      if (!quiz || !proposal) {
        return res.status(404).json({ error: 'Quiz or proposal not found' })
      }
      
      // Use dolphin-mistral-7b-v2.8 for subjective evaluation
      const evaluation = await competenceAI.evaluateSubjectiveResponse(
        proposal.content,
        quiz.questions,
        essay
      )
      
      if (evaluation.passed) {
        // Award ACent for passing subjective evaluation
        const event = await changeApp.attemptQuiz(username, `${quizId}_subjective`, { essay }, true)
        const user = await changeApp.getUser(username)
        
        res.json({
          success: true,
          passed: true,
          evaluation,
          user,
          event
        })
      } else {
        res.json({
          success: true,
          passed: false,
          evaluation,
          requiresHumanReview: evaluation.requiresHumanReview
        })
      }
      
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Proposal System
  app.post('/api/proposals', async (req, res) => {
    try {
      const { username, title, content, scope } = req.body
      
      const event = await changeApp.createProposal(username, title, content, scope)
      const proposal = await changeApp.getProposal(event.data.id)
      
      res.json({ success: true, proposal, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/api/proposals/:id', async (req, res) => {
    try {
      const proposal = await changeApp.getProposal(req.params.id)
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' })
      }
      res.json(proposal)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/api/proposals', async (req, res) => {
    try {
      const scope = req.query.scope || 'neighborhood'
      const proposals = await changeApp.getProposalsByScope(scope)
      res.json(proposals)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.post('/api/proposals/:id/vote', async (req, res) => {
    try {
      const { username, vote, isDelegated, delegator } = req.body
      
      const event = await changeApp.voteOnProposal(
        username, 
        req.params.id, 
        vote, 
        isDelegated, 
        delegator
      )
      
      const proposal = await changeApp.getProposal(req.params.id)
      const user = await changeApp.getUser(username)
      
      res.json({ success: true, proposal, user, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/api/proposals/:id/vote-status', async (req, res) => {
    try {
      const { username } = req.query
      const proposalId = req.params.id
      
      const user = await changeApp.getUser(username)
      if (!user) {
        return res.json({ canVote: false, hasVoted: false, reason: 'User not found' })
      }
      
      // Special case for founding proposal - can vote after tutorial quiz
      if (proposalId === 'FOUNDING_PROPOSAL_PROTECTED') {
        const hasPassedTutorial = user.quizzesPassed.includes('tutorial')
        const hasVoted = user.votesSubmitted.includes(proposalId)
        
        return res.json({ 
          canVote: hasPassedTutorial, 
          hasVoted,
          reason: hasPassedTutorial ? 'Tutorial completed' : 'Must complete tutorial first'
        })
      }
      
      // For other proposals, check if user passed the proposal-specific quiz
      const hasPassedQuiz = user.quizzesPassed.includes(proposalId)
      const hasVoted = user.votesSubmitted.includes(proposalId)
      
      res.json({ 
        canVote: hasPassedQuiz, 
        hasVoted,
        reason: hasPassedQuiz ? 'Quiz passed' : 'Must pass quiz first'
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  app.post('/api/proposals/:id/upvote', async (req, res) => {
    try {
      const { username } = req.body
      
      const event = await changeApp.upvoteProposal(username, req.params.id)
      const proposal = await changeApp.getProposal(req.params.id)
      
      res.json({ success: true, proposal, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Comment System
  app.post('/api/comments', async (req, res) => {
    try {
      const { username, proposalId, content } = req.body
      
      const event = await changeApp.createComment(username, proposalId, content)
      const comment = await changeApp.stateManager.getComment(event.data.id)
      
      res.json({ success: true, comment, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/api/proposals/:id/comments', async (req, res) => {
    try {
      const comments = await changeApp.getComments(req.params.id)
      res.json(comments)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.post('/api/comments/:id/vote', async (req, res) => {
    try {
      const { username, vote } = req.body
      
      const event = await changeApp.voteOnComment(username, req.params.id, vote)
      const comment = await changeApp.stateManager.getComment(req.params.id)
      
      res.json({ success: true, comment, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Delegation System
  app.post('/api/delegations', async (req, res) => {
    try {
      const { username, delegate, proposalId } = req.body
      
      const event = await changeApp.setDelegation(username, delegate, proposalId)
      const user = await changeApp.getUser(username)
      
      res.json({ success: true, user, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  app.delete('/api/delegations', async (req, res) => {
    try {
      const { username, proposalId } = req.body
      
      const event = await changeApp.revokeDelegation(username, proposalId)
      const user = await changeApp.getUser(username)
      
      res.json({ success: true, user, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Token Transfers
  app.post('/api/tokens/transfer', async (req, res) => {
    try {
      const { from, to, amount, type } = req.body
      
      let event
      if (type === 'acents') {
        event = await changeApp.transferACents(from, to, amount)
      } else if (type === 'dcents') {
        event = await changeApp.transferDCents(from, to, amount)
      } else {
        return res.status(400).json({ error: 'Invalid token type' })
      }
      
      const fromUser = await changeApp.getUser(from)
      const toUser = await changeApp.getUser(to)
      
      res.json({ success: true, fromUser, toUser, event })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
  
  // Catch-all for frontend routing
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'frontend/dist' })
  })
  
  return server
}

// Helper functions
async function getQuizById(changeApp, quizId) {
  // In simplified storage, quizzes are stored with 'quiz_' prefix
  return changeApp.storage.get(`quiz_${quizId}`) || null
}

function calculateScore(userAnswers, correctAnswers) {
  if (!userAnswers || !correctAnswers || userAnswers.length !== correctAnswers.length) {
    return 0
  }
  
  const correct = userAnswers.filter((answer, index) => answer === correctAnswers[index]).length
  return correct / correctAnswers.length
}

