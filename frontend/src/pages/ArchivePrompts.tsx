import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { usePrompts } from "@/context/PromptsContext";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const stripStagePrefix = (stage: string) => stage.replace(/^\d+\.\s*/, "").trim();

const htmlToPlainText = (html: string) => {
  const raw = html?.trim() ?? "";
  if (!raw || !/<[a-z][\s\S]*>/i.test(raw)) return raw;
  try {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return raw.replace(/<[^>]+>/gi, " ").replace(/\s+/g, " ").trim();
  }
};

const truncate = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n)}…` : s);

const ArchivePrompts = () => {
  const { archivedPrompts, fetchArchivedPrompts, restoreArchivedPrompts } = usePrompts();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isRestoring, setIsRestoring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchArchivedPrompts();
  }, [fetchArchivedPrompts]);

  useEffect(() => {
    const valid = new Set(archivedPrompts.map((p) => p.id));
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [archivedPrompts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return archivedPrompts.filter((p) => {
      if (!q) return true;
      const plainPrompt = htmlToPlainText(p.promptText).toLowerCase();
      const plainAdditional = htmlToPlainText(p.additionalInput ?? "").toLowerCase();
      const plainQuestion = htmlToPlainText(p.question).toLowerCase();
      const stageLabel = stripStagePrefix(p.stage).toLowerCase();
      return (
        plainPrompt.includes(q) ||
        plainAdditional.includes(q) ||
        plainQuestion.includes(q) ||
        stageLabel.includes(q) ||
        p.steps.toLowerCase().includes(q) ||
        String(p.originalPromptId).includes(q) ||
        p.createdByDisplay.toLowerCase().includes(q) ||
        (p.archivedByDisplay?.toLowerCase().includes(q) ?? false) ||
        (p.approvedByDisplay?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [archivedPrompts, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginatedFiltered = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someFilteredSelected =
    filteredIds.some((id) => selected.has(id)) && !allFilteredSelected;

  const toggleRow = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredIds.forEach((id) => next.add(id));
      } else {
        filteredIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Restore ${ids.length} prompt(s) to the live prompts list? They will reappear for employees and on Browse (subject to each row’s approval status).`,
      )
    ) {
      return;
    }
    setIsRestoring(true);
    try {
      await restoreArchivedPrompts(ids);
      setSelected(new Set());
      toast.success(`Restored ${ids.length} prompt(s) to the main list.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">Archive</h1>
        <p className="text-sm opacity-90 mt-1">
          {archivedPrompts.length} archived prompt{archivedPrompts.length === 1 ? "" : "s"} — select rows
          in the table, then choose Move to prompts above.
        </p>
      </header>

      <div className="bg-card rounded-xl shadow-card p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <Input
          placeholder="Search archived prompts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md"
        />
        <Button
          type="button"
          variant="secondary"
          className="md:ml-auto shrink-0"
          disabled={selected.size === 0 || isRestoring}
          onClick={handleBulkRestore}
        >
          <ArchiveRestore className="w-4 h-4 mr-2" />
          {isRestoring ? "Restoring…" : `Move to prompts (${selected.size})`}
        </Button>
      </div>

      {selected.size > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          {selected.size} row{selected.size === 1 ? "" : "s"} selected — row checkboxes are on this page only; the header checkbox selects or clears every row that matches your search (all pages).
        </p>
      )}

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {archivedPrompts.length === 0
              ? "No archived prompts yet."
              : "No archived prompts match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false
                      }
                      onCheckedChange={(v) => toggleSelectAllFiltered(v === true)}
                      aria-label="Select all archived rows matching current search"
                    />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Archive #</TableHead>
                  <TableHead className="whitespace-nowrap">Original ID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Additional</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Approved by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead>Archived by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFiltered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="align-top pt-3">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={(v) => toggleRow(p.id, v === true)}
                        aria-label={`Select archived row ${p.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-xs font-mono">{p.id}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.originalPromptId}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{stripStagePrefix(p.stage)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{p.steps}</TableCell>
                    <TableCell className="text-xs max-w-[180px]">
                      {truncate(htmlToPlainText(p.question), 56)}
                    </TableCell>
                    <TableCell className="text-xs max-w-[220px]">
                      {truncate(htmlToPlainText(p.promptText))}
                    </TableCell>
                    <TableCell className="text-xs max-w-[160px] text-muted-foreground">
                      {truncate(htmlToPlainText(p.additionalInput ?? "")) || "—"}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{p.createdByDisplay}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.approvedByDisplay ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status as "pending" | "approved" | "rejected"} />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDt(p.archivedAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.archivedByDisplay ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    type="button"
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-9",
                      currentPage === page && "bg-primary text-primary-foreground",
                    )}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
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
            Showing {paginatedFiltered.length} of {filtered.length} matching rows (page {currentPage} of{" "}
            {totalPages})
          </div>
        </>
      )}
    </div>
  );
};

export default ArchivePrompts;
