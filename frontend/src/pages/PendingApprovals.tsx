import { useEffect, useMemo, useState } from "react";
import { Check, SquareArrowOutUpRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrompts } from "@/context/PromptsContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import PromptDetailDialog from "@/components/PromptDetailDialog";
import type { Prompt } from "@/data/prompts";

const ALL_STAGES = "all";
const ALL_STEPS = "all";

const RenderPromptCell = ({ html }: { html: string }) => {
  if (!html) return <span>No content</span>;

  return <span className="rich-prompt-cell" dangerouslySetInnerHTML={{ __html: html }} />;
};

const PendingApprovals = () => {
  const { user } = useAuth();
  const { prompts, approvePrompt, rejectPrompt } = usePrompts();
  const pending = useMemo(() => prompts.filter((p) => p.status === "pending"), [prompts]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);
  const [stepsFilter, setStepsFilter] = useState<string>(ALL_STEPS);
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const stages = useMemo(() => Array.from(new Set(pending.map((p) => p.stage))), [pending]);
  const steps = useMemo(() => Array.from(new Set(pending.map((p) => p.steps))), [pending]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pending.filter((p) => {
      const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
      const matchesSteps = stepsFilter === ALL_STEPS || p.steps === stepsFilter;
      const plainText = p.promptText.replace(/<[^>]*>/g, "");
      const matchesQuery =
        !q ||
        plainText.toLowerCase().includes(q) ||
        p.question.toLowerCase().includes(q) ||
        p.createdBy.toLowerCase().includes(q);
      return matchesStage && matchesSteps && matchesQuery;
    });
  }, [pending, search, stageFilter, stepsFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, stepsFilter]);

  const handleApprove = (id: number) => {
    if (!user) return;
    approvePrompt(id, user.email);
    toast.success("Prompt approved");
    setIsDetailOpen(false);
    setSelectedPrompt(null);
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailOpen(true);
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
    <div className="max-w-6xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">Pending Approvals</h1>
        <p className="text-sm opacity-90 mt-1">{pending.length} prompt(s) awaiting review</p>
      </header>

      <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder="Search pending prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STAGES}>All Stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stepsFilter} onValueChange={setStepsFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All Steps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STEPS}>All Steps</SelectItem>
            {steps.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-8 text-center text-muted-foreground">
          No pending prompts match your filters.
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[120px]">Stage</TableHead>
                  <TableHead className="w-[100px]">Steps</TableHead>
                  <TableHead className="w-[220px]">Question addressed</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="w-[120px]">Created by</TableHead>
                  <TableHead className="w-[210px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPrompts.map((p) => (
                  <TableRow key={p.id} className="align-top hover:bg-muted/50 transition-colors">
                    <TableCell className="align-top">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                          stageBadgeClass(p.stage),
                        )}
                      >
                        {p.stage}
                      </span>
                    </TableCell>
                    <TableCell className="align-top">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                          stepsBadgeClass(p.stage),
                        )}
                      >
                        {p.steps}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm italic text-muted-foreground align-top">
                      📌 {p.question.length > 70 ? `${p.question.substring(0, 70)}...` : p.question}
                    </TableCell>
                    <TableCell className="text-sm text-foreground align-top">
                      <div className="group/prompt relative line-clamp-2 max-w-[350px] pr-6">
                        <RenderPromptCell html={p.promptText} />
                        <button
                          type="button"
                          onClick={() => handlePromptClick(p)}
                          className="absolute top-0 right-0 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Open prompt details"
                        >
                          <SquareArrowOutUpRight className="w-4 h-4 opacity-100" aria-hidden="true" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium align-top">{p.createdBy}</TableCell>
                    <TableCell className="align-top">
                      <div className="flex justify-end gap-2">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedPrompts.map((p) => (
              <article key={p.id} className="bg-card rounded-xl p-4 shadow-card hover:shadow-lg transition-all">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                      stageBadgeClass(p.stage),
                    )}
                  >
                    {p.stage}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                      stepsBadgeClass(p.stage),
                    )}
                  >
                    {p.steps}
                  </span>
                </div>
                <p className="italic text-muted-foreground mb-3 text-sm">
                  📌 {p.question.length > 70 ? `${p.question.substring(0, 70)}...` : p.question}
                </p>
                <div className="group/prompt bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
                  <div className="relative line-clamp-2 pr-6">
                    <RenderPromptCell html={p.promptText} />
                    <button
                      type="button"
                      onClick={() => handlePromptClick(p)}
                      className="absolute top-0 right-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Open prompt details"
                    >
                      <SquareArrowOutUpRight className="w-4 h-4 opacity-100" aria-hidden="true" />
                    </button>
                  </div>
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn("w-9", currentPage === page && "bg-primary text-primary-foreground")}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground mt-4">
            Showing {paginatedPrompts.length} of {filtered.length} pending prompts
          </div>
        </>
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

      <PromptDetailDialog
        prompt={selectedPrompt}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        userRole={user?.role}
        showFeedbackSection={false}
        extraFooterActions={
          selectedPrompt ? (
            <>
              <Button
                className="bg-like text-like-foreground hover:bg-like/90"
                onClick={() => handleApprove(selectedPrompt.id)}
              >
                <Check className="w-4 h-4 mr-1" /> Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  openReject(selectedPrompt.id);
                  setIsDetailOpen(false);
                }}
              >
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
            </>
          ) : null
        }
      />
    </div>
  );
};

export default PendingApprovals;