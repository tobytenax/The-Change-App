import React, { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Award, 
  Brain, 
  Users, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Coins,
  Shield
} from 'lucide-react'

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to The Change App',
    icon: Users,
    content: `Welcome! Before we set you loose inside the Change App, there are some things you should know. Things work differently here than anywhere else you've been. You may want to take notes, as there will be a test.

The Change App is an unprecedented actualization of decentralized Direct Democracy. It's designed to extract and distill your most competent aspects both as individuals and communities.

We aim to accomplish this by reframing the collective's incentive structures, using competence as the fulcrum.

As a measure of worth, **scarcity has outlived its usefulness to us**. Its role in dictating our value judgments now lacks the obviousness that it commanded all throughout industrialization, urbanization, globalization, and right up to the base of the steep AI wall we now face.

**Scarcity must now be decoupled from attribution of value**, lest AI outclass, outfinesse, and outperform us with impunity. Failure to sever this paradigm would amount to civilizational ruin.

You've no doubt noticed the ineptitude of our existing structures to take on this task. The entrenched power structures have contingencies for their contingencies to secure the privilege of power we granted them.

**Let them have their doomsday bunkers, and good riddance.**`
  },
  {
    id: 'anonymity',
    title: 'Anonymous by Default',
    icon: Shield,
    content: `In recognition of their continued presence here at present time, the Change App enshrouds its user base with **anonymity by default**. We are not sitting ducks with nametags to assist in our undoing.

We cannot be divided and conquered if we cannot be classified and divided at all - when our sole differentiating features are the quality of our thoughts.

Let us take one of our greatest weaknesses and forge it into a weapon of surgical accuracy. **The Change App harnesses conflict to fuel refinement and innovation** via eventual consistency - guided by deliberation, disagreement, iteration, refinement, and competitive coexistence.

Agendas don't have arbitrary deadlines - they enjoy natural lifecycles marked by perpetual improvement. A proposal's scope is filtered solely by its relevance in the eyes of the people that voluntarily engage with it, **scaling from local neighborhoods to the farthest reaches of our known universe**.`
  },
  {
    id: 'competence',
    title: 'Competence Verification',
    icon: Brain,
    content: `Voting in the Change App is a unique experience, as it's guarded by interactive quizzes, incentivized by a revolutionary dual token economy that rewards competence and participation in separate ledgers that meet when minds do.

Before you can cast a vote, you'll need to demonstrate that you understand the proposal's particulars and potentials.

If you don't pass the competence exam for a proposal with at least 75%, you'll get a chance to explain your rationale to our open source uncensored **Dolphin Mistral AI**, which will assess whether you're an eccentric genius with uncommon outlier brilliance, or if you simply don't know jack.

If you disagree with the Dolphin model's assessment, you can initiate a human review process. If you still aren't deemed "competent" enough to vote on the proposal, **keep your head up. Earth currently hosts ZERO humans capable of competence in every possible area. None.**

In fact, **ACents don't have any actual value unless a good portion of quiz takers "fail"**. If the verbiage rolled off one's tongue a bit smoother, we'd call that a 'feature' rather than a "failure". The viability of this economy relies on this feature for its fiscal health. It just so happens to also ensure that every vote is a well informed one.`
  },
  {
    id: 'tokens',
    title: 'The Revolutionary Dual Token Economy',
    icon: Coins,
    content: `So, before you rage quit and toss this app in the recycle bin, take heart and note that there are several other methods of minting ACents: contributing popular comments to the alchemical zone, referring competent friends, or even asking for some (**ACents are as transferable as cash**).

**Every quiz you pass grants both 1 ACent and access to the ballot box it guards.** Interacting with the ballot box also rewards 1 ACent (for firsthand votes, and 1/2 an ACent for delegated ones. The other half goes to the delegator).

**To synthesize these aspects together**: the ACent is a currency minted through competence - not competent thinking alone, but competent action as well - the results of which represent the actual factual basis of value.

**Successful implementations of community proposals produce Changes** in people's communities and the quality of that change fuels the strength of the ACent.

If you prefer to delegate your voting power rather than monkeying with quizzes and essays, you'll earn a **DCent** in the process. DCents are used to gain access to the delegation box, where you can name any living human to represent you on this issue - you'll split the ACent generated by their vote.`
  },
  {
    id: 'alchemical',
    title: 'The Alchemical Zone',
    icon: Lightbulb,
    content: `The Alchemical Zone resembles a Reddit thread that is differentiated in a few ways. First, **the cost to comment is 3 DCents if the commenter hasn't demonstrated competence** on the issue (it's free otherwise).

Everybody can earn one DCent per comment that they interact with whether they upvote or downvote it. It's not as futile as it is everywhere else on the web, and that's thanks to the Alchemical Zone's dynamics.

**Comments are eligible for integration into proposals** by one of two ways: gaining assent of the author, who then exchanges the comment's DCents for ACents, earning a spot amongst the 30% pool of Alchemists. Their comment is integrated into the official proposal, and they become a stakeholder in the success of that proposal.

The second way for a comment to integrate into the official proposal is to **surpass the proposal's number of upvotes** (city level and higher). The Alchemist pool in a proposal holds both a stake in the proposal's success, and a duty to ensure that success, since **no ACents are distributed from escrow until every one of them agrees that the proposal is fully implemented**.`
  },
  {
    id: 'implementation',
    title: 'Implementation & Real World Change',
    icon: Target,
    content: `If you're a hands-on difference maker, there's a place for you as well. When a would-be implementer notices a proposal with an attractive number of ACents accrued, they can place a bid for their release from escrow.

**Here's how this works:** 40% of a proposal's ACent escrow is provisioned for the implementer (half up front and half when the job is done), 30% go to the author, and the rest is shared by the alchemists.

**The Change App isn't the place where incompetence goes far** - if one can walk the talk, they'll walk away with the lion's share in the end.

To bid for an implementation, an ACent bond equal to the upfront ACent payout is needed. This bond is added to escrow to protect the proposal from failed implementations in the event of damages in the commission of the project.

Success is judged by the author and the alchemists, whose interests are aligned with your success by their own payout structure relying on your success before the escrow is released.

**So, whether you're a quiz champion by choice, delegating your voice, rolling up your sleeves and doing the work, or rallying a neighborhood of competent peers together, the Change App empowers you every step of the way.**`
  },
  {
    id: 'revolution',
    title: 'Block by Block Revolution',
    icon: Globe,
    content: `Naturally, nobody is going to prefer ACents over dollars or pounds in the early stages of the Change App, but you'd be well advised to consider the intrinsic relativity of any fiat currency compared with de jure money.

Your governments have leveraged your current fiat currency to high heaven - and they get away with it precisely as long as you allow it. Because when it comes down to it, **fiat currency's value lies in YOUR GOOD FAITH and their assumption of YOUR future labor**.

In contrast, **ACents have tangible undeniable value proportional to the Change App's successes** - from the neighborhood garden it facilitates on your own block to the ibogaine clinic it enables downtown, to adoption of zero point energy systems worldwide.

**Block by block, we will take this planet back! I hope you're ready...**

Ready to earn your first ACent and join the revolution?`
  }
]

export default function Tutorial({ user, onUserUpdate }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentTutorialStep = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  const generateTutorialQuiz = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/quiz/generate', {
        proposalId: 'tutorial'
      })

      if (response.data.success) {
        // The backend now sends options with letters, so we use them directly.
        setQuizQuestions(response.data.questions)
        setShowQuiz(true)
      } else {
        throw new Error(response.data.error || 'Failed to generate quiz')
      }
    } catch (error) {
      console.error('Quiz generation error:', error)
      setError('Failed to load the quiz. Please try again.')
      setShowQuiz(false)
    }
    
    setLoading(false)
  }

  const submitQuiz = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/quiz/attempt', {
        quizId: 'tutorial',
        username: user.username,
        answers: userAnswers
      })

      if (response.data.success) {
        setQuizResult(response.data)
        if (response.data.passed) {
          onUserUpdate({
            ...user,
            acents: (user.acents || 0) + 1,
            hasPassedTutorial: true
          })
        }
      } else {
        throw new Error(response.data.error || 'Failed to submit quiz')
      }
    } catch (error) {
      console.error('Quiz submission error:', error)
      setError('Failed to submit quiz. Please try again.')
    }
    
    setLoading(false)
  }

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      generateTutorialQuiz()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (showQuiz && !quizResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Tutorial Competence Quiz
            </CardTitle>
            <CardDescription>
              Demonstrate your understanding to earn your first ACent and join the revolution!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {quizQuestions.map((question, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold">Question {index + 1}: {question.question}</h3>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optionIndex}
                        onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                        className="text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowQuiz(false)}>
                Back to Tutorial
              </Button>
              <Button 
                onClick={submitQuiz} 
                disabled={loading || Object.keys(userAnswers).length !== quizQuestions.length}
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {quizResult.passed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {Math.round(quizResult.score * 100)}%
              </div>
              <div className="text-lg">
                {quizResult.passed ? (
                  <span className="text-green-600">Congratulations! You've earned your first ACent! 🎉</span>
                ) : (
                  <span className="text-red-600">You've earned a DCent. You can delegate your vote to someone who passed.</span>
                )}
              </div>
            </div>
            
            {quizResult.passed && (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800">
                  Welcome to the revolution! You now have <strong>1 ACent</strong> and can vote on the founding proposal: 
                  the Digital Bill of Rights.
                </p>
              </div>
            )}
            
            <div className="text-center">
              <Button onClick={() => window.location.reload()}>
                Continue to The Change App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">The Change App Tutorial</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentTutorialStep.icon className="h-6 w-6" />
            {currentTutorialStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none">
            {currentTutorialStep.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4" dangerouslySetInnerHTML={{ 
                __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <Button onClick={nextStep}>
          {currentStep === TUTORIAL_STEPS.length - 1 ? (
            <>
              Take Quiz <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
