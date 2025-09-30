import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User,
  Award,
  Users,
  Brain,
  Key,
  Calendar,
  TrendingUp,
  Shield,
  Copy,
  CheckCircle
} from 'lucide-react'

export default function UserProfile({ user, onUserUpdate }) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription>
                Member since {formatDate(user.createdAt)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span>ACents (Competence)</span>
            </CardTitle>
            <CardDescription>
              Earned through demonstrated competence and democratic participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {user.acents}
            </div>
            <div className="text-sm text-gray-600">
              {user.acents >= 3 ? 'Can submit proposals' : `Need ${3 - user.acents} more to submit proposals`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>DCents (Delegation)</span>
            </CardTitle>
            <CardDescription>
              Earned through participation and used for delegation and comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {user.dcents}
            </div>
            <div className="text-sm text-gray-600">
              Used for delegation, comments, and participation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competence History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Competence Verification History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Quizzes Passed</h4>
              {user.quizzesPassed && user.quizzesPassed.length > 0 ? (
                <div className="space-y-2">
                  {user.quizzesPassed.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">{quiz.quizId}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{quiz.acentsEarned} ACent
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No quizzes passed yet</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-red-700 mb-2">Quizzes Failed</h4>
              {user.quizzesFailed && user.quizzesFailed.length > 0 ? (
                <div className="space-y-2">
                  {user.quizzesFailed.map((quizId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm">{quizId}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        +1 DCent
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No failed quizzes</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Referral Network</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Referred By</h4>
              {user.referredBy ? (
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium">{user.referredBy}</span>
                  <p className="text-xs text-gray-600 mt-1">
                    Your referrer earned an ACent when you joined
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Direct registration</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Your Referrals</h4>
              {user.referrals && user.referrals.length > 0 ? (
                <div className="space-y-2">
                  {user.referrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">{referral}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +1 ACent
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No referrals yet</p>
              )}
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Earn your 3rd ACent:</strong> Refer someone to The Change App using your username. 
              You'll earn an ACent when they register, regardless of their quiz performance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cryptographic Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Cryptographic Identity</span>
          </CardTitle>
          <CardDescription>
            Your anonymous identity is secured by cryptographic keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Public Key</h4>
            <div className="p-3 bg-gray-50 rounded font-mono text-sm break-all">
              {user.cryptoIdentity?.publicKey || 'Not available'}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Private Key</h4>
            <div className="space-y-2">
              {!showPrivateKey ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrivateKey(true)}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Show Private Key
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded font-mono text-sm break-all">
                    {localStorage.getItem('changeapp_private_key') || 'Not available'}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(localStorage.getItem('changeapp_private_key'))}
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPrivateKey(false)}
                      className="flex-1"
                    >
                      Hide
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Keep your private key secure!</strong> This is your only way to access your account. 
                Store it safely and never share it with anyone.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Account Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{user.quizzesPassed?.length || 0}</div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{user.referrals?.length || 0}</div>
              <div className="text-sm text-gray-600">Referrals Made</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Proposals Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

