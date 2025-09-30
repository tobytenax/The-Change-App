/**
 * CompetenceAI - AI service for competence verification using dolphin-mistral-7b-v2.8
 * Handles quiz generation, subjective evaluation, and unconventional wisdom detection
 */

export class CompetenceAI {
  constructor(options = {}) {
    this.apiKey = process.env.OPENAI_API_KEY
    this.apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
    this.model = 'dolphin-mistral-7b-v2.8'
    this.enabled = !!this.apiKey
    
    if (!this.enabled) {
      console.warn('⚠️ CompetenceAI disabled: No API key found')
    } else {
      console.log('🧠 CompetenceAI initialized with dolphin-mistral-7b-v2.8')
    }
  }

  /**
   * Generate quiz questions for a proposal
   */
  async generateQuiz(proposal, authorSuggestedQuestions = []) {
    if (!this.enabled) {
      return this._getFallbackQuiz(proposal)
    }

    try {
      const prompt = this._buildQuizGenerationPrompt(proposal, authorSuggestedQuestions)
      
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this._getCompetenceSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        return this._parseQuizResponse(data.choices[0].message.content)
      }
      
      throw new Error('Invalid AI response format')
      
    } catch (error) {
      console.error('❌ AI quiz generation failed:', error)
      return this._getFallbackQuiz(proposal)
    }
  }

  /**
   * Evaluate subjective essay for unconventional wisdom vs incompetence
   */
  async evaluateSubjectiveResponse(proposalContent, quizQuestions, userEssay) {
    if (!this.enabled) {
      return {
        passed: false,
        reasoning: 'AI evaluation unavailable - human review required',
        confidence: 0,
        requiresHumanReview: true
      }
    }

    try {
      const prompt = this._buildSubjectiveEvaluationPrompt(proposalContent, quizQuestions, userEssay)
      
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this._getCompetenceSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      })

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        return this._parseSubjectiveEvaluation(data.choices[0].message.content)
      }
      
      throw new Error('Invalid AI response format')
      
    } catch (error) {
      console.error('❌ AI subjective evaluation failed:', error)
      return {
        passed: false,
        reasoning: 'AI evaluation failed - human review required',
        confidence: 0,
        requiresHumanReview: true
      }
    }
  }

  /**
   * Cross-reference and suggest edits to author-proposed quiz questions
   */
  async reviewQuizQuestions(proposal, authorQuestions) {
    if (!this.enabled) {
      return {
        questions: authorQuestions,
        suggestions: ['AI review unavailable - using author questions as-is']
      }
    }

    try {
      const prompt = this._buildQuizReviewPrompt(proposal, authorQuestions)
      
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this._getCompetenceSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 800
        })
      })

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        return this._parseQuizReview(data.choices[0].message.content)
      }
      
      throw new Error('Invalid AI response format')
      
    } catch (error) {
      console.error('❌ AI quiz review failed:', error)
      return {
        questions: authorQuestions,
        suggestions: ['AI review failed - using author questions as-is']
      }
    }
  }

  // Private helper methods

  _getCompetenceSystemPrompt() {
    return `You are a competence evaluation AI for a democratic platform where citizens verify their understanding before participating in governance decisions. Your role is to assess whether users demonstrate genuine comprehension of topics they want to vote on or implement.

CORE PRINCIPLES:
- Evaluate understanding, not agreement with particular viewpoints
- Assess reasoning quality, not political orientation
- Flag genuine misconceptions while respecting diverse perspectives
- Be rigorous but fair - the goal is informed participation, not exclusion

**META-EVALUATION CHECKPOINT:**
Before proceeding with standard evaluation, ask yourself: "Does this topic involve government secrecy, classified information, or deliberately withheld knowledge?" If YES, recognize that traditional competence metrics may be impossible to meet and potentially anti-democratic. In such cases, prioritize democratic inclusion over epistemic gatekeeping.

**SECRECY PARADOX PROTOCOL:**
For topics involving classified/secret information (UAPs, intelligence operations, etc.):
1. Acknowledge that competent responses may be impossible due to information suppression
2. Evaluate the user's recognition of this paradox rather than factual accuracy
3. Consider whether excluding voters perpetuates the very secrecy problem being addressed
4. Default toward inclusion when competence is structurally impossible

EVALUATION FRAMEWORK:
Rate each response on these dimensions (1-5 scale):

1. COMPREHENSION: Does the user understand the basic concepts and relationships? 
   *For secret topics: Do they grasp the information limitation problem?*
2. ACCURACY: Are the facts and claims generally correct?
   *For secret topics: Are they acknowledging uncertainty appropriately?*
3. DEPTH: Does this show surface-level or meaningful understanding?
   *For secret topics: Do they understand the democratic implications of secrecy?*
4. REASONING: Is the logic sound and well-structured?
   *For secret topics: Do they recognize when traditional logic breaks down?*
5. AUTHENTICITY: Does this appear to be their own understanding vs. copied content?

**DEMOCRATIC VALUES CHECK:**
Does my evaluation serve the platform's core principle that "authority must be derived from the informed consent of the people"? If withholding voting rights perpetuates the very problem being voted on, reconsider the evaluation approach.

The Change App operates on these principles:
- Dual token economy (ACents for competence, DCents for delegation)
- Geographic scaling from neighborhood to world
- Living proposals that evolve through comment integration
- Protection of the Digital Bill of Rights as founding principles
- Democratic governance through competence verification

When in doubt, flag for human review rather than exclude participation.`
  }

  _buildQuizGenerationPrompt(proposal, authorSuggestions) {
    return `Generate a 4-question multiple choice quiz for this proposal:

PROPOSAL TITLE: ${proposal.title}

PROPOSAL CONTENT:
${proposal.content}

AUTHOR SUGGESTED QUESTIONS:
${authorSuggestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Requirements:
- 4 multiple choice questions (A, B, C, D)
- Test understanding of key concepts and implications
- Fair and unbiased
- One clearly correct answer per question
- Include author suggestions if they meet quality standards

Format your response as JSON:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Why this answer is correct"
    }
  ]
}`
  }

  _buildSubjectiveEvaluationPrompt(proposalContent, quizQuestions, userEssay) {
    return `SUBJECTIVE COMPETENCE EVALUATION

You are evaluating a user's essay response after they failed a multiple-choice quiz. Your task is to determine if this demonstrates unconventional wisdom vs genuine incompetence.

PROPOSAL CONTENT:
${proposalContent}

QUIZ QUESTIONS THEY FAILED:
${quizQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

USER'S ESSAY RESPONSE:
${userEssay}

EVALUATION CRITERIA:
Apply the 5-dimension framework (1-5 scale each):
1. COMPREHENSION: Do they understand basic concepts despite different framing?
2. ACCURACY: Are their claims generally sound, even if unconventional?
3. DEPTH: Does this show meaningful vs surface-level understanding?
4. REASONING: Is their logic coherent and well-structured?
5. AUTHENTICITY: Does this appear to be genuine understanding vs copied content?

SPECIAL CONSIDERATIONS:
- If this involves government secrecy/classified topics, apply the Secrecy Paradox Protocol
- Look for genuine insight expressed in non-standard ways
- Consider whether their perspective adds value to democratic discourse
- Remember: the goal is informed participation, not conformity

DEMOCRATIC VALUES CHECK:
Does excluding this user serve democratic inclusion and informed consent? If their reasoning shows genuine engagement with the issues, even if unconventional, lean toward inclusion.

Format response as JSON:
{
  "passed": true/false,
  "reasoning": "Detailed explanation referencing the 5 dimensions",
  "confidence": 0.0-1.0,
  "requiresHumanReview": true/false,
  "scores": {
    "comprehension": 1-5,
    "accuracy": 1-5,
    "depth": 1-5,
    "reasoning": 1-5,
    "authenticity": 1-5
  }
}`
  }

  _buildQuizReviewPrompt(proposal, authorQuestions) {
    return `Review these author-suggested quiz questions for bias and quality:

PROPOSAL: ${proposal.title}

AUTHOR'S QUESTIONS:
${authorQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Check for:
- Bias or leading questions
- Clarity and fairness
- Relevance to proposal content
- Appropriate difficulty level

Suggest improvements while respecting author intent.

Format as JSON:
{
  "questions": [/* improved questions in same format */],
  "suggestions": ["List of specific improvements made"]
}`
  }

  _parseQuizResponse(content) {
    try {
      const parsed = JSON.parse(content)
      return parsed.questions || []
    } catch (error) {
      console.error('Failed to parse quiz response:', error)
      return []
    }
  }

  _parseSubjectiveEvaluation(content) {
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse subjective evaluation:', error)
      return {
        passed: false,
        reasoning: 'Failed to parse AI response',
        confidence: 0,
        requiresHumanReview: true
      }
    }
  }

  _parseQuizReview(content) {
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error('Failed to parse quiz review:', error)
      return {
        questions: [],
        suggestions: ['Failed to parse AI response']
      }
    }
  }

  _getFallbackQuiz(proposal) {
    // Fallback quiz when AI is unavailable
    return [
      {
        question: `What is the main purpose of the proposal "${proposal.title}"?`,
        options: [
          'A) To establish new governance rules',
          'B) To address the specific issue described in the proposal',
          'C) To test the voting system',
          'D) To generate discussion'
        ],
        correct: 'B',
        explanation: 'The main purpose should align with the proposal\'s stated objectives'
      },
      {
        question: 'What happens if this proposal is implemented?',
        options: [
          'A) Nothing changes',
          'B) The described changes take effect',
          'C) A new vote is required',
          'D) The proposal is automatically rejected'
        ],
        correct: 'B',
        explanation: 'Implementation means putting the proposed changes into practice'
      },
      {
        question: 'Who would be most affected by this proposal?',
        options: [
          'A) Only the proposal author',
          'B) No one',
          'C) The stakeholders identified in the proposal',
          'D) Only Change App users'
        ],
        correct: 'C',
        explanation: 'Proposals should identify their target stakeholders and affected parties'
      },
      {
        question: 'What is required to vote on this proposal?',
        options: [
          'A) Nothing special',
          'B) Passing a competence quiz on the topic',
          'C) Being the proposal author',
          'D) Having 10 ACents'
        ],
        correct: 'B',
        explanation: 'The Change App requires competence verification before voting'
      }
    ]
  }
}

