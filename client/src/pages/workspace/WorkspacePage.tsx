import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { assignmentApi, submissionApi, hintApi } from '../../services/api';
import { AssignmentPanel } from '../../components/workspace/AssignmentPanel';
import { CodeEditor } from '../../components/editor/CodeEditor';
import { ReviewPanel } from '../../components/workspace/ReviewPanel';
import { LoadingSpinner, CelebrationOverlay } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Card';
import type { ReviewResponse, SolutionRevealResponse } from '../../services/api';

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);
  const [hintText, setHintText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [solutionData, setSolutionData] = useState<SolutionRevealResponse | null>(null);

  const { data: assignment, isLoading, error, refetch } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (assignment) {
      // Only restore saved progress from the server — never stale localStorage on first open
      setCode(assignment.savedCode ?? assignment.starterCode);
    }
  }, [assignment?.id, assignment?.starterCode, assignment?.savedCode]);

  const autosave = useCallback(async (currentCode: string) => {
    if (!id || !currentCode) return;
    localStorage.setItem(`code_${id}`, currentCode);
    try {
      await assignmentApi.saveCode(id, currentCode);
    } catch {
      // silent fail for autosave
    }
  }, [id]);

  useEffect(() => {
    if (!code || !id) return;
    const timer = setTimeout(() => autosave(code), 3000);
    return () => clearTimeout(timer);
  }, [code, id, autosave]);

  const reviewMutation = useMutation({
    mutationFn: () => submissionApi.review({ assignmentId: id!, code }),
    onSuccess: (res) => {
      setReviewResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (res.data.score === 100) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      toast.success(res.data.passed ? 'Great job!' : 'Keep trying!');
    },
    onError: () => toast.error('Review failed. Please try again.'),
  });

  const hintMutation = useMutation({
    mutationFn: () => hintApi.getHint({ assignmentId: id!, code }),
    onSuccess: (res) => {
      setHintText(res.data.hint);
      toast.success(`Hint level ${res.data.level}`);
    },
    onError: () => toast.error('Failed to get hint'),
  });

  const revealMutation = useMutation({
    mutationFn: () => assignmentApi.revealSolution(id!),
    onSuccess: (res) => {
      setSolutionData(res.data);
      setCode(res.data.solutionCode);
      setShowRevealModal(false);
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      toast.success('Solution revealed');
    },
    onError: () => toast.error('Failed to reveal solution'),
  });

  const handleReset = () => {
    if (assignment) {
      localStorage.removeItem(`code_${assignment.id}`);
      setCode(assignment.starterCode);
      setReviewResult(null);
      toast.success('Code reset to starter');
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading assignment..." />;
  if (error || !assignment) return <ErrorState message="Assignment not found" onRetry={() => refetch()} />;

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
      <CelebrationOverlay show={showCelebration} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="overflow-y-auto">
          <AssignmentPanel
            assignment={assignment}
            onGetHint={() => hintMutation.mutate()}
            hintText={hintText}
            isLoadingHint={hintMutation.isPending}
          />

          {reviewResult && <ReviewPanel result={reviewResult} />}

          {solutionData && (
            <div className="mt-4 glass-card p-4">
              <h3 className="font-bold text-arduino-400 mb-2">Solution Explanation</h3>
              <p className="text-sm text-gray-300 mb-3">{solutionData.explanation.explanation}</p>
              {solutionData.explanation.differences.length > 0 && (
                <>
                  <h4 className="text-sm font-semibold mb-1">Differences from your code:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {solutionData.explanation.differences.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col min-h-[500px] lg:min-h-0">
          <CodeEditor
            code={code}
            onChange={setCode}
            onCheck={() => reviewMutation.mutate()}
            onReset={handleReset}
            onReveal={() => setShowRevealModal(true)}
            isChecking={reviewMutation.isPending}
            gradingDisabled={assignment.gradingDisabled}
            readOnly={assignment.gradingDisabled}
          />
        </div>
      </div>

      <Modal isOpen={showRevealModal} onClose={() => setShowRevealModal(false)} title="Reveal Solution?">
        <p className="text-gray-400 text-sm mb-6">
          Revealing the solution will disable grading for this assignment. Are you sure?
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowRevealModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => revealMutation.mutate()} disabled={revealMutation.isPending} className="btn-primary flex-1">
            {revealMutation.isPending ? 'Loading...' : 'Reveal Solution'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function WorkspaceRedirect() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Select an assignment from your dashboard or history.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
    </div>
  );
}
