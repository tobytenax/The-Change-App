import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle,
  FileText, // For Proposals
  Vote // For Votes
} from 'lucide-react';

export default function UserProfile({ user, onUserUpdate }) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latestUser, setLatestUser] = useState(user);

  // Fetch the latest user data when the component mounts
  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (user?.username) {
        try {
          const response = await axios.get(`/api/users/${user.username}`);
          setLatestUser(response.data);
          // Optionally, update the parent component's state as well
          if (onUserUpdate) {
            onUserUpdate(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch latest user data:", error);
          // Keep the initial user data if fetch fails
          setLatestUser(user);
        }
      }
    };

    fetchLatestUserData();
  }, [user?.username]);


  const copyToClipboard = (text) => {
    // navigator.clipboard is not always available in secure contexts (like iframes)
    // Using a fallback for wider compatibility.
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!latestUser) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">{latestUser.username}</CardTitle>
              <CardDescription>
                Member since {formatDate(latestUser.createdAt)}
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
              Earned through competence and participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {latestUser.acents}
            </div>
            <div className="text-sm text-gray-600">
              {latestUser.acents >= 3 ? 'Can submit proposals' : `Need ${3 - latestUser.acents} more to submit proposals`}
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
              Earned for participation and used for delegation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {latestUser.dcents}
            </div>
            <div className="text-sm text-gray-600">
              Used for delegation, comments, and participation
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="text-2xl font-bold text-blue-600">{latestUser.quizzesPassed?.length || 0}</div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{latestUser.referrals?.length || 0}</div>
              <div className="text-sm text-gray-600">Referrals Made</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div> {/* Assuming this is not yet implemented */}
              <div className="text-sm text-gray-600">Proposals Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{latestUser.votesSubmitted?.length || 0}</div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </div>
          </div>
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
              {latestUser.cryptoIdentity?.publicKey || 'Not available'}
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
                    {localStorage.getItem('changeapp_private_key') || 'Not available in this session'}
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
            
            <Alert className="mt-4 border-red-200 bg-red-50">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Keep your private key secure!</strong> This is your only way to access your account. 
                Store it safely and never share it with anyone.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
