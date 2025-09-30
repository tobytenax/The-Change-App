/**
 * Event Types for The Change App
 * These define all possible events that can occur in the system
 */

export const EventTypes = {
  // User Management Events
  USER_REGISTER: 'USER_REGISTER',
  
  // Quiz and Competence Events
  QUIZ_ATTEMPT: 'QUIZ_ATTEMPT',
  QUIZ_PASS: 'QUIZ_PASS',
  QUIZ_FAIL: 'QUIZ_FAIL',
  QUIZ_SUBJECTIVE_ATTEMPT: 'QUIZ_SUBJECTIVE_ATTEMPT',
  QUIZ_AI_EVALUATION: 'QUIZ_AI_EVALUATION',
  QUIZ_HUMAN_REVIEW: 'QUIZ_HUMAN_REVIEW',
  
  // Proposal Events
  PROPOSAL_CREATE: 'PROPOSAL_CREATE',
  PROPOSAL_VOTE: 'PROPOSAL_VOTE',
  PROPOSAL_UPVOTE: 'PROPOSAL_UPVOTE',
  PROPOSAL_SCALE_UP: 'PROPOSAL_SCALE_UP', // Geographic scaling
  PROPOSAL_VERSION_UPDATE: 'PROPOSAL_VERSION_UPDATE', // When comments are integrated
  
  // Comment Events
  COMMENT_CREATE: 'COMMENT_CREATE',
  COMMENT_VOTE: 'COMMENT_VOTE',
  COMMENT_INTEGRATE_AUTO: 'COMMENT_INTEGRATE_AUTO',
  COMMENT_INTEGRATE_MANUAL: 'COMMENT_INTEGRATE_MANUAL',
  
  // Delegation Events
  DELEGATION_SET: 'DELEGATION_SET',
  DELEGATION_REVOKE: 'DELEGATION_REVOKE',
  DELEGATION_VOTE: 'DELEGATION_VOTE',
  
  // Token Transfer Events
  ACENT_TRANSFER: 'ACENT_TRANSFER',
  DCENT_TRANSFER: 'DCENT_TRANSFER',
  ACENT_EARN: 'ACENT_EARN',
  DCENT_EARN: 'DCENT_EARN',
  ACENT_SPEND: 'ACENT_SPEND',
  DCENT_SPEND: 'DCENT_SPEND',
  
  // Implementer Events
  IMPLEMENTER_BOND: 'IMPLEMENTER_BOND',
  IMPLEMENTER_BID: 'IMPLEMENTER_BID',
  IMPLEMENTER_APPROVE: 'IMPLEMENTER_APPROVE',
  IMPLEMENTER_START: 'IMPLEMENTER_START',
  IMPLEMENTATION_VERIFY: 'IMPLEMENTATION_VERIFY',
  IMPLEMENTATION_COMPLETE: 'IMPLEMENTATION_COMPLETE',
  IMPLEMENTATION_FAIL: 'IMPLEMENTATION_FAIL',
  
  // Payout Events
  PAYOUT_CALCULATE: 'PAYOUT_CALCULATE',
  PAYOUT_DISTRIBUTE: 'PAYOUT_DISTRIBUTE',
  PAYOUT_AUTHOR: 'PAYOUT_AUTHOR',
  PAYOUT_COMMENTERS: 'PAYOUT_COMMENTERS',
  PAYOUT_IMPLEMENTER: 'PAYOUT_IMPLEMENTER',
  
  // Referral Events
  REFERRAL_CREATE: 'REFERRAL_CREATE',
  REFERRAL_COMPLETE: 'REFERRAL_COMPLETE',
  
  // System Events
  SYSTEM_INIT: 'SYSTEM_INIT',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE'
}

/**
 * Event validation schemas
 */
export const EventSchemas = {
  [EventTypes.USER_REGISTER]: {
    required: ['username'],
    optional: ['referredBy', 'email']
  },
  
  [EventTypes.QUIZ_PASS]: {
    required: ['username', 'quizId', 'score'],
    optional: ['answers', 'timeSpent']
  },
  
  [EventTypes.QUIZ_FAIL]: {
    required: ['username', 'quizId', 'score'],
    optional: ['answers', 'timeSpent']
  },
  
  [EventTypes.PROPOSAL_CREATE]: {
    required: ['id', 'title', 'content', 'author', 'scope'],
    optional: ['isProtected', 'isFoundingProposal', 'cost']
  },
  
  [EventTypes.PROPOSAL_VOTE]: {
    required: ['username', 'proposalId', 'vote'],
    optional: ['isDelegated', 'delegator']
  },
  
  [EventTypes.COMMENT_CREATE]: {
    required: ['id', 'proposalId', 'author', 'content'],
    optional: ['cost', 'parentCommentId']
  },
  
  [EventTypes.DELEGATION_SET]: {
    required: ['username', 'delegate'],
    optional: ['proposalId', 'scope']
  },
  
  [EventTypes.ACENT_TRANSFER]: {
    required: ['from', 'to', 'amount'],
    optional: ['reason', 'proposalId']
  }
}

/**
 * Validate event structure
 */
export function validateEvent(event) {
  if (!event.type || !EventTypes[event.type]) {
    throw new Error(`Invalid event type: ${event.type}`)
  }
  
  const schema = EventSchemas[event.type]
  if (!schema) {
    return true // No validation schema defined
  }
  
  // Check required fields
  for (const field of schema.required) {
    if (!(field in event.data)) {
      throw new Error(`Missing required field '${field}' for event type ${event.type}`)
    }
  }
  
  return true
}

/**
 * Create a properly formatted event
 */
export function createEvent(type, data, metadata = {}) {
  const event = {
    type,
    data,
    timestamp: Date.now(),
    id: crypto.randomUUID(),
    ...metadata
  }
  
  validateEvent(event)
  return event
}

