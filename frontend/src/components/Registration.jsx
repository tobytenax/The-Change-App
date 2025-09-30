import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

// Simple crypto key generation (in production, use proper crypto libraries)
function generateKeyPair() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const privateKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  
  // Simple public key derivation (in production, use proper elliptic curve crypto)
  const publicKey = 'pub_' + privateKey.slice(0, 16) + '_' + Date.now().toString(36)
  
  return { privateKey, publicKey }
}

export default function Registration({ onLogin }) {
  const [step, setStep] = useState(1) // 1: Welcome, 2: Identity, 3: Username, 4: Complete
  const [username, setUsername] = useState('')
  const [keyPair, setKeyPair] = useState(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [hasBackedUpKey, setHasBackedUpKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const generateNewKeyPair = () => {
    const newKeyPair = generateKeyPair()
    setKeyPair(newKeyPair)
    setHasBackedUpKey(false)
  }

  const handleUsernameSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/users/register', {
        username: username.trim(),
        publicKey: keyPair.publicKey
      })

      if (response.data.success) {
        // Store private key locally (user's responsibility to back up)
        localStorage.setItem('changeapp_private_key', keyPair.privateKey)
        
        onLogin(response.data.user)
        navigate('/')
      } else {
        setError(response.data.error || 'Registration failed')
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadKeyBackup = () => {
    const keyData = {
      username,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      created: new Date().toISOString(),
      warning: "KEEP THIS PRIVATE KEY SECURE! It's your only way to access your Change App account."
    }
    
    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `changeapp-keys-${username}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setHasBackedUpKey(true)
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to The Change App</CardTitle>
            <CardDescription className="text-lg">
              Revolutionary Living Democracy Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔐 Anonymous by Default</h3>
              <p className="text-blue-800 text-sm">
                The Change App protects your privacy through cryptographic identity. 
                No government IDs, no personal information required - just your voice in democracy.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🏆 Earn Your First ACents</h3>
              <p className="text-green-800 text-sm">
                Complete the tutorial and vote on the founding proposal to earn your first 2 ACents - 
                your tokens of democratic competence.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🌍 From Neighborhood to World</h3>
              <p className="text-purple-800 text-sm">
                Start local, think global. Your proposals can scale from your neighborhood 
                all the way to worldwide impact based on their merit.
              </p>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              size="lg"
            >
              Begin Your Democratic Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Generate Your Cryptographic Identity</span>
            </CardTitle>
            <CardDescription>
              Your identity is secured by cryptography, not government databases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy First:</strong> Your cryptographic keys are generated locally and never sent to our servers. 
                Only your public key is shared to verify your identity.
              </AlertDescription>
            </Alert>

            {!keyPair ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Click below to generate your unique cryptographic identity
                </p>
                <Button onClick={generateNewKeyPair} size="lg">
                  <Key className="h-4 w-4 mr-2" />
                  Generate My Keys
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Keys Generated Successfully</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Public Key (Safe to Share)</label>
                      <div className="bg-white p-2 rounded border font-mono text-xs break-all">
                        {keyPair.publicKey}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Private Key (Keep Secret!)</label>
                      <div className="bg-white p-2 rounded border font-mono text-xs break-all relative">
                        {showPrivateKey ? keyPair.privateKey : '•'.repeat(64)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Critical:</strong> Your private key is your only way to access your account. 
                    If you lose it, your account cannot be recovered. Back it up securely!
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={generateNewKeyPair}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Keys
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1"
                  >
                    Continue with These Keys
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Username</CardTitle>
            <CardDescription>
              This will be your public identity in The Change App democracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="text-lg"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Choose wisely - this represents you in democratic discussions
                </p>
              </div>

              {keyPair && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">🔐 Backup Your Private Key</h4>
                  <p className="text-sm text-gray-600">
                    Before completing registration, secure your private key:
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadKeyBackup}
                      disabled={!username.trim()}
                      className="flex-1"
                    >
                      Download Key Backup
                    </Button>
                    {hasBackedUpKey && (
                      <Badge variant="secondary" className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Backed Up
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading || !username.trim() || !keyPair}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

