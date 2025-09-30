import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Crown,
  Globe,
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowLeft,
  Shield,
  Award,
  Brain,
  CheckCircle,
  AlertCircle,
  Info,
  Vote
} from 'lucide-react'

const SCOPE_ICONS = {
  neighborhood: Users,
  city: '🏙️',
  state: '🗺️', 
  country: '🇺🇸',
  continent: '🌍',
  world: Globe
}

const SCOPE_LABELS = {
  neighborhood: 'Neighborhood',
  city: 'City/Town',
  state: 'State/Province', 
  country: 'Country',
  continent: 'Continent',
  world: 'World'
}

export default function ProposalView({ user, onUserUpdate }) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  
  // Voting state
  const [canVote, setCanVote] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingLoading, setVotingLoading] = useState(false)
  
  // Essay state for failed quiz
  const [showEssay, setShowEssay] = useState(false)
  const [essay, setEssay] = useState('')
  const [essayLoading, setEssayLoading] = useState(false)

  useEffect(() => {
    loadProposal()
  }, [id])

  const loadProposal = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/proposals/${id}`)
      setProposal(response.data)
      
      // Check if user can vote (has passed quiz for this proposal)
      const userVoteStatus = await axios.get(`/api/proposals/${id}/vote-status?username=${user.username}`)
      setCanVote(userVoteStatus.data.canVote)
      setHasVoted(userVoteStatus.data.hasVoted)
      
    } catch (error) {
      console.error('Failed to load proposal:', error)
      setError('Failed to load proposal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    setQuizLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/quiz/generate', {
        proposalId: id
      })
      
      if (response.data.success) {
        setQuizQuestions(response.data.questions)
        setShowQuiz(true)
      } else {
        throw new Error(response.data.error || 'Failed to generate quiz')
      }
    } catch (error) {
      console.error('Quiz generation failed:', error)
      setError('Failed to generate quiz. Please try again.')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const submitQuiz = async () => {
    setQuizLoading(true)
    setError('')

    try {
      const answers = Object.values(userAnswers)
      
      const response = await axios.post('/api/quiz/attempt', {
        username: user.username,
        quizId: id,
        answers
      })

      if (response.data.success) {
        setQuizResult(response.data)
        if (response.data.passed) {
          setCanVote(true)
          onUserUpdate(response.data.user)
        }
      } else {
        throw new Error(response.data.error || 'Quiz submission failed')
      }
    } catch (error) {
      console.error('Quiz submission failed:', error)
      setError('Failed to submit quiz. Please try again.')
    } finally {
      setQuizLoading(false)
    }
  }

  const submitEssay = async () => {
    setEssayLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/quiz/essay-evaluation', {
        username: user.username,
        proposalId: id,
        essay: essay.trim()
      })

      if (response.data.success) {
        setQuizResult(response.data)
        if (response.data.passed) {
          setCanVote(true)
          onUserUpdate(response.data.user)
        }
        setShowEssay(false)
      } else {
        throw new Error(response.data.error || 'Essay evaluation failed')
      }
    } catch (error) {
      console.error('Essay evaluation failed:', error)
      setError('Failed to evaluate essay. Please try again.')
    } finally {
      setEssayLoading(false)
    }
  }

  const vote = async (voteType) => {
    setVotingLoading(true)
    setError('')

    try {
      const response = await axios.post(`/api/proposals/${id}/vote`, {
        username: user.username,
        vote: voteType // 'for' or 'against'
      })

      if (response.data.success) {
        setHasVoted(true)
        onUserUpdate(response.data.user)
        // Refresh proposal data to show updated vote counts
        loadProposal()
      } else {
        throw new Error(response.data.error || 'Voting failed')
      }
    } catch (error) {
      console.error('Voting failed:', error)
      setError('Failed to submit vote. Please try again.')
    } finally {
      setVotingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Proposal not found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const ScopeIcon = SCOPE_ICONS[proposal.scope] || Globe
  const isFoundingProposal = proposal.isProtected

  // Show quiz interface
  if (showQuiz && !quizResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Competence Verification Quiz</span>
            </CardTitle>
            <CardDescription>
              Demonstrate your understanding of "{proposal.title}" to earn voting rights (75% required to pass)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizQuestions.map((question, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium">
                  Question {index + 1}: {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option.charAt(0)}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowQuiz(false)}
                disabled={quizLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitQuiz}
                disabled={quizLoading || Object.keys(userAnswers).length < quizQuestions.length}
                className="flex-1"
              >
                {quizLoading ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show essay interface
  if (showEssay) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Unconventional Wisdom Evaluation</span>
            </CardTitle>
            <CardDescription>
              Explain your understanding of "{proposal.title}" in your own words. 
              Our AI will evaluate whether you demonstrate genuine competence expressed in unconventional ways.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Understanding (minimum 100 words)
              </label>
              <Textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Explain your understanding of this proposal, its implications, and why you believe your perspective adds value to the democratic discussion..."
                rows={8}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {essay.length} characters • Be specific and demonstrate deep understanding
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowEssay(false)}
                disabled={essayLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitEssay}
                disabled={essayLoading || essay.trim().length < 100}
                className="flex-1"
              >
                {essayLoading ? 'Evaluating...' : 'Submit for AI Evaluation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      {/* Proposal header */}
      <Card className={isFoundingProposal ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                {isFoundingProposal && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Founding Proposal
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center space-x-1">
                  {typeof ScopeIcon === 'string' ? (
                    <span className="text-sm">{ScopeIcon}</span>
                  ) : (
                    <ScopeIcon className="h-3 w-3" />
                  )}
                  <span>{SCOPE_LABELS[proposal.scope]}</span>
                </Badge>
                {proposal.isProtected && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl mb-2">
                {proposal.title}
              </CardTitle>
              
              <CardDescription>
                By {proposal.author} • {new Date(proposal.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proposal content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-lg max-w-none">
            {proposal.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="h-5 w-5" />
            <span>Democratic Participation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canVote && !hasVoted && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Competence verification required:</strong> Take a quiz to demonstrate your understanding before voting. 
                  You'll earn an ACent regardless of whether you vote for or against this proposal.
                </AlertDescription>
              </Alert>
              
              <Button onClick={startQuiz} disabled={quizLoading} className="w-full">
                {quizLoading ? 'Generating Quiz...' : 'Take Competence Quiz'}
              </Button>
            </div>
          )}

          {quizResult && !quizResult.passed && (
            <div className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  You scored {Math.round(quizResult.score * 100)}% (need 75% to pass). 
                  You've earned 1 DCent and can delegate your vote to someone who passed.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEssay(true)}
                  className="flex-1"
                >
                  Submit Essay for AI Review
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setQuizResult(null)
                    setUserAnswers({})
                    startQuiz()
                  }}
                  className="flex-1"
                >
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}

          {canVote && !hasVoted && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>You're qualified to vote!</strong> You'll earn an ACent regardless of how you vote. 
                  Vote based on your genuine assessment of this proposal.
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => vote('for')}
                  disabled={votingLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Vote For
                </Button>
                <Button 
                  onClick={() => vote('against')}
                  disabled={votingLoading}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Vote Against
                </Button>
              </div>
            </div>
          )}

          {hasVoted && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Thank you for participating!</strong> Your vote has been recorded and you've earned an ACent. 
                You can change your vote at any time, but you'll only be paid once.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Proposal stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{proposal.votesFor || 0}</div>
              <div className="text-sm text-gray-600">Votes For</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{proposal.votesAgainst || 0}</div>
              <div className="text-sm text-gray-600">Votes Against</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{proposal.upvotes || 0}</div>
              <div className="text-sm text-gray-600">Upvotes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{proposal.acentBalance || 0}</div>
              <div className="text-sm text-gray-600">ACent Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

