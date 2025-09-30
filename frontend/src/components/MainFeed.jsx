import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown,
  Globe,
  Users,
  ThumbsUp,
  MessageSquare,
  ArrowRight,
  Shield,
  Award,
  Info
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

export default function MainFeed({ user, scope, onUserUpdate }) {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProposals()
  }, [scope])

  const loadProposals = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`/api/proposals?scope=${scope}`)
      setProposals(response.data)
    } catch (error) {
      console.error('Failed to load proposals:', error)
      setError('Failed to load proposals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ProposalCard = ({ proposal }) => {
    const ScopeIcon = SCOPE_ICONS[proposal.scope] || Globe
    const isFoundingProposal = proposal.isProtected
    
    return (
      <Card className={`hover:shadow-md transition-shadow ${isFoundingProposal ? 'border-gold-200 bg-gradient-to-r from-yellow-50 to-amber-50' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
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
              
              <CardTitle className="text-xl mb-2">
                {proposal.title}
              </CardTitle>
              
              <CardDescription className="text-sm text-gray-600">
                By {proposal.author} • {new Date(proposal.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 line-clamp-3">
              {proposal.content.substring(0, 200)}...
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{proposal.upvotes || 0} upvotes</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{proposal.comments || 0} comments</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>{proposal.acentBalance || 0} ACents</span>
              </div>
            </div>
            
            <Link to={`/proposal/${proposal.id}`}>
              <Button variant="outline" size="sm">
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome message for new users */}
      {user.acents === 1 && (
        <Alert className="border-green-200 bg-green-50">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Congratulations!</strong> You've earned your first ACent by completing the tutorial. 
            Now vote on the founding proposal below to earn your second ACent and unlock full platform access.
          </AlertDescription>
        </Alert>
      )}

      {/* Scope header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {SCOPE_LABELS[scope]} Proposals
          </h1>
          <p className="text-gray-600 mt-1">
            Democratic proposals at the {scope} level
          </p>
        </div>
        
        {user.acents >= 3 && (
          <Button>
            <Award className="h-4 w-4 mr-2" />
            Submit Proposal (3 ACents)
          </Button>
        )}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Proposals list */}
      <div className="space-y-4">
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No proposals yet at this scope
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to submit a proposal for the {SCOPE_LABELS[scope]} level!
              </p>
              {user.acents >= 3 && (
                <Button>
                  Submit First Proposal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        )}
      </div>

      {/* Educational footer */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              How Geographic Scaling Works
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Proposals start at the neighborhood level and can scale up based on support. 
              Each level requires both competent support (ACents) and popular participation (total voters). 
              Only truly universal principles can reach the world level, while local issues stay local.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

