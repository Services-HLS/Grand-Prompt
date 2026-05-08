import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrompts } from "@/context/PromptsContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
import { cn } from "@/lib/utils";

const PendingApprovals = () => {
  const { user } = useAuth();
  const { prompts, approvePrompt, rejectPrompt } = usePrompts();
  const pending = useMemo(() => prompts.filter((p) => p.status === "pending"), [prompts]);


    console.log("Current user:", user);
  console.log("Total prompts:", prompts.length);
  console.log("Pending prompts:", pending);
  console.log("All prompts statuses:", prompts.map(p => ({ id: p.id, status: p.status, category: p.category })));
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const handleApprove = (id: number) => {
    if (!user) return;
    approvePrompt(id, user.email);
    toast.success("Prompt approved");
  };

  const openReject = (id: number) => {
    setRejectId(id);
    setReason("");
    setReasonError(null);
  };

  const confirmReject = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setReasonError("Please provide a reason (min 3 characters).");
      return;
    }
    if (rejectId == null || !user) return;
    rejectPrompt(rejectId, trimmed, user.email);
    toast.success("Prompt rejected");
    setRejectId(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-sm opacity-90 mt-1">{pending.length} prompt(s) awaiting review</p>
      </header>

      {pending.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-8 text-center text-muted-foreground">
          🎉 Nothing pending. You're all caught up.
        </div>
      ) : (
        pending.map((p) => (
          <article key={p.id} className="bg-card rounded-xl p-5 mb-4 shadow-card">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
                {p.stage}
              </span>
              <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
                {p.steps}
              </span>
            </div>
            <p className="italic text-muted-foreground mb-3 text-sm">📌 {p.question}</p>
            <div className="bg-prompt-box border border-border rounded-lg p-4 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {p.promptText}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Submitted by <span className="font-medium text-foreground">{p.createdBy}</span> ·{" "}
                {new Date(p.submittedAt).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-like text-like-foreground hover:bg-like/90"
                  onClick={() => handleApprove(p.id)}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openReject(p.id)}>
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          </article>
        ))
      )}

      <Dialog open={rejectId != null} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Explain why this prompt is being rejected..."
            />
            {reasonError && <p className="text-sm text-destructive">{reasonError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApprovals;