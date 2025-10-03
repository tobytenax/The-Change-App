import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, CircleSlash, Brain, Vote } from 'lucide-react';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

export default function ProposalView({ user, onUserUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [voteStatus, setVoteStatus] = useState({ canVote: false, hasVoted: false, reason: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    const fetchProposalAndStatus = async () => {
      if (!user) {
        navigate('/register');
        return;
      }
      try {
        setLoading(true);
        setError('');
        const proposalRes = await axios.get(`/api/proposals/${id}`);
        setProposal(proposalRes.data);

        const statusRes = await axios.get(`/api/proposals/${id}/vote-status?username=${user.username}`);
        setVoteStatus(statusRes.data);

      } catch (err) {
        console.error("Error fetching proposal data:", err);
        setError('Failed to load proposal data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposalAndStatus();
  }, [id, user, navigate]);

  const handleVote = async () => {
    if (!selectedVote) {
      setError("Please select a voting option.");
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`/api/proposals/${id}/vote`, {
        username: user.username,
        vote: selectedVote
      });

      if (response.data.success) {
        setProposal(response.data.proposal);
        onUserUpdate(response.data.user);
        setVoteStatus({ ...voteStatus, canVote: false, hasVoted: true });
        setSelectedVote(null); // Reset selection after voting
      } else {
        throw new Error(response.data.error || "Failed to submit vote.");
      }
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takeQuiz = () => {
    // Navigate to a quiz component, passing proposal ID
    // This logic would need to be built out more fully
    alert("Navigating to quiz for this proposal...");
  };

  if (loading) {
    return <div className="text-center p-10">Loading proposal...</div>;
  }

  if (error && !proposal) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }
  
  if (!proposal) {
    return <div className="text-center p-10">Proposal not found.</div>;
  }

  const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
  const forPercentage = totalVotes > 0 ? (proposal.votes.for / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votes.against / totalVotes) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">{proposal.scope}</Badge>
              <CardTitle className="text-2xl md:text-3xl">{proposal.title}</CardTitle>
            </div>
            <Badge variant={proposal.isProtected ? "destructive" : "secondary"}>
              {proposal.isProtected ? 'Protected' : 'Standard'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: proposal.content.replace(/\n/g, '<br />') }} />

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span>For ({proposal.votes.for})</span>
                <span>{forPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={forPercentage} className="h-3 bg-green-200" indicatorClassName="bg-green-600" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span>Against ({proposal.votes.against})</span>
                <span>{againstPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={againstPercentage} className="h-3 bg-red-200" indicatorClassName="bg-red-600" />
            </div>
            <div className="text-center text-sm text-gray-500">
              {totalVotes} total votes | {proposal.votes.abstain} abstained
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 bg-gray-50 p-6">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {/* *** FIX: UPDATED VOTING UI LOGIC *** */}
          {!voteStatus.hasVoted && (
            <>
              {voteStatus.canVote ? (
                <div className="w-full text-center space-y-4">
                  <h3 className="font-semibold text-lg">Cast Your Vote</h3>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant={selectedVote === 'for' ? 'default' : 'outline'}
                      className={`px-6 py-3 ${selectedVote === 'for' ? 'bg-green-600' : ''}`}
                      onClick={() => setSelectedVote('for')}
                    >
                      <ThumbsUp className="mr-2 h-5 w-5" /> For
                    </Button>
                    <Button
                      variant={selectedVote === 'against' ? 'default' : 'outline'}
                      className={`px-6 py-3 ${selectedVote === 'against' ? 'bg-red-600' : ''}`}
                      onClick={() => setSelectedVote('against')}
                    >
                      <ThumbsDown className="mr-2 h-5 w-5" /> Against
                    </Button>
                    <Button
                      variant={selectedVote === 'abstain' ? 'default' : 'outline'}
                      className="px-6 py-3"
                      onClick={() => setSelectedVote('abstain')}
                    >
                      <CircleSlash className="mr-2 h-5 w-5" /> Abstain
                    </Button>
                  </div>
                  <Button onClick={handleVote} disabled={loading || !selectedVote} className="w-1/2">
                    <Vote className="mr-2 h-5 w-5" /> Submit Vote
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Brain className="h-8 w-8 mx-auto text-blue-600" />
                  <p className="font-semibold">{voteStatus.reason}</p>
                  {proposal.isFoundingProposal ? (
                     <Button onClick={() => navigate('/tutorial')}>Complete Tutorial</Button>
                  ) : (
                     <Button onClick={takeQuiz}>Take Competence Quiz</Button>
                  )}
                </div>
              )}
            </>
          )}

          {voteStatus.hasVoted && (
            <div className="text-center text-green-600 font-semibold text-lg">
              Thank you for voting!
            </div>
          )}

        </CardFooter>
      </Card>
    </div>
  );
}
