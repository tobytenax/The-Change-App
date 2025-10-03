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
        return res.status(400).json({ success: false, error: 'Username and public key are required' })
      }
      
      if (!/^[a-zA-Z0-9_\- ]{3,20}$/.test(username)) {
        return res.status(400).json({ 
          success: false,
          error: 'Username must be 3-20 characters, letters, numbers, underscore, dash, or space only' 
        })
      }
      
      const existingUser = await changeApp.getUser(username)
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Username already exists' })
      }
      
      const event = await changeApp.registerUser(username, referredBy, { publicKey })
      const user = await changeApp.getUser(username)
      
      res.json({ 
        success: true, 
        user,
        event,
        message: 'Registration successful! Welcome to The Change App.' 
      })
    } catch (error) {
      console.error('❌ Registration error:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  app.get('/api/users/:username', async (req, res) => {
    try {
      const user = await changeApp.getUser(req.params.username)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }
      res.json(user)
    } catch (error) {
      console.error(`❌ Error fetching user ${req.params.username}:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })

  app.delete('/api/users/:username', async (req, res) => {
    try {
      const user = await changeApp.getUser(req.params.username)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }
      
      await changeApp.deleteUser(req.params.username)
      res.json({ success: true, message: `User ${req.params.username} deleted successfully` })
    } catch (error) {
      console.error(`❌ Error deleting user ${req.params.username}:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  // Quiz System
  app.post('/api/quiz/attempt', async (req, res) => {
    try {
      const { username, quizId, answers } = req.body;
      if (!username || !quizId || !answers) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const result = await changeApp.attemptQuiz(username, quizId, answers);
      
      res.json({ success: true, ...result });

    } catch (error) {
      console.error('❌ Error during quiz attempt:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  app.post('/api/quiz/generate', async (req, res) => {
    try {
      const { proposalId } = req.body;
      const quiz = await getQuizById(changeApp, proposalId);

      if (!quiz) {
        return res.status(404).json({ success: false, error: `Quiz for ${proposalId} not found.` });
      }
      
      res.json({ 
        success: true, 
        quizId: quiz.id,
        questions: quiz.questions.map(q => ({
          question: q.question,
          options: q.options
        }))
      });
    } catch (error) {
      console.error(`❌ Error generating quiz for ${req.body.proposalId}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get('/api/proposals/:id/vote-status', async (req, res) => {
    try {
      const { username } = req.query;
      const proposalId = req.params.id;

      if (!username) {
        return res.status(400).json({ success: false, error: 'Username is required' });
      }

      const user = await changeApp.getUser(username);
      if (!user) {
        return res.status(404).json({ canVote: false, hasVoted: false, reason: 'User not found' });
      }
      
      const hasVoted = user.votesSubmitted && user.votesSubmitted.includes(proposalId);

      // Your desired flow: Pass tutorial to vote on founding proposal
      if (proposalId === 'FOUNDING_PROPOSAL_PROTECTED') {
        const hasPassedTutorial = user.quizzesPassed && user.quizzesPassed.includes('tutorial');
        return res.json({ 
          canVote: hasPassedTutorial, 
          hasVoted,
          reason: hasPassedTutorial ? 'Ready to vote' : 'You must pass the tutorial quiz to vote on the founding proposal.'
        });
      }

      // Logic for all other proposals (requires specific quiz)
      const hasPassedQuiz = user.quizzesPassed && user.quizzesPassed.includes(proposalId);
      res.json({ 
        canVote: hasPassedQuiz, 
        hasVoted,
        reason: hasPassedQuiz ? 'Ready to vote' : `You must pass the competence quiz for this proposal to vote.`
      });
      
    } catch (error) {
      console.error(`❌ Error checking vote status for ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Proposal System
  app.post('/api/proposals', async (req, res) => {
    try {
      const { username, title, content, scope } = req.body
      const event = await changeApp.createProposal(username, title, content, scope)
      const proposal = await changeApp.getProposal(event.data.id)
      res.json({ success: true, proposal, event })
    } catch (error) {
      console.error(`❌ Error creating proposal:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  app.get('/api/proposals/:id', async (req, res) => {
    try {
      const proposal = await changeApp.getProposal(req.params.id)
      if (!proposal) {
        return res.status(404).json({ success: false, error: 'Proposal not found' })
      }
      res.json(proposal)
    } catch (error) {
      console.error(`❌ Error fetching proposal ${req.params.id}:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  app.get('/api/proposals', async (req, res) => {
    try {
      const scope = req.query.scope || 'neighborhood'
      const proposals = await changeApp.getProposalsByScope(scope)
      res.json(proposals)
    } catch (error) {
      console.error(`❌ Error fetching proposals for scope ${req.query.scope}:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  app.post('/api/proposals/:id/vote', async (req, res) => {
    try {
      const { username, vote, isDelegated, delegator } = req.body
      const event = await changeApp.voteOnProposal(username, req.params.id, vote, isDelegated, delegator)
      const proposal = await changeApp.getProposal(req.params.id)
      const user = await changeApp.getUser(username)
      res.json({ success: true, proposal, user, event })
    } catch (error) {
      console.error(`❌ Error voting on proposal ${req.params.id}:`, error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
  
  // Catch-all for frontend routing
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'frontend/dist' })
  })
  
  return server
}

// Helper function
async function getQuizById(changeApp, quizId) {
  return changeApp.storage.get(`quiz_${quizId}`) || null
}
