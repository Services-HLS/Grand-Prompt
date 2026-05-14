import { useEffect, useMemo, useState } from "react";
import { Archive } from "lucide-react";
import { toast } from "sonner";
import { usePrompts } from "@/context/PromptsContext";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";

const ALL = "all";
const ITEMS_PER_PAGE = 10;

/** "1. Idea development" → "Idea development" */
const stripStagePrefix = (stage: string) => stage.replace(/^\d+\.\s*/, "").trim();

/** Rich-text / HTML → plain text for table cells */
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

const AllPrompts = () => {
  const { prompts, archivePrompts } = usePrompts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [employeeFilter, setEmployeeFilter] = useState<string>(ALL);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isArchiving, setIsArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSelected((prev) => {
      const valid = new Set(prompts.map((p) => p.id));
      const next = new Set<number>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [prompts]);

  const employees = useMemo(
    () => Array.from(new Set(prompts.map((p) => p.createdBy))),
    [prompts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prompts.filter((p) => {
      const matchesStatus = statusFilter === ALL || p.status === statusFilter;
      const matchesEmployee = employeeFilter === ALL || p.createdBy === employeeFilter;
      const plainPrompt = htmlToPlainText(p.promptText).toLowerCase();
      const plainAdditional = htmlToPlainText(p.additionalInput ?? "").toLowerCase();
      const plainQuestion = htmlToPlainText(p.question).toLowerCase();
      const stageLabel = stripStagePrefix(p.stage).toLowerCase();
      const matchesQuery =
        !q ||
        plainPrompt.includes(q) ||
        plainAdditional.includes(q) ||
        plainQuestion.includes(q) ||
        stageLabel.includes(q) ||
        p.steps.toLowerCase().includes(q) ||
        (p.approvedBy?.toLowerCase().includes(q) ?? false);
      return matchesStatus && matchesEmployee && matchesQuery;
    });
  }, [prompts, search, statusFilter, employeeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, employeeFilter]);

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

  const handleMoveToArchive = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Move ${ids.length} prompt(s) to the archive? They will be removed from the main prompt list (feedback and reactions are deleted with the prompt).`,
      )
    ) {
      return;
    }
    setIsArchiving(true);
    try {
      await archivePrompts(ids);
      setSelected(new Set());
      toast.success(`Archived ${ids.length} prompt(s).`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Archive failed");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">All Prompts</h1>
        <p className="text-sm opacity-90 mt-1">{prompts.length} total prompts in system</p>
      </header>

      <div className="bg-card rounded-xl shadow-card p-4 mb-4 flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All employees</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          className="md:ml-auto shrink-0"
          disabled={selected.size === 0 || isArchiving}
          onClick={handleMoveToArchive}
        >
          <Archive className="w-4 h-4 mr-2" />
          {isArchiving ? "Archiving…" : `Move to archive (${selected.size})`}
        </Button>
      </div>

      {selected.size > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          {selected.size} selected — row checkboxes are on this page only; the header checkbox selects or clears every row that matches your filters (all pages).
        </p>
      )}

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No prompts match.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false
                    }
                    onCheckedChange={(v) => toggleSelectAllFiltered(v === true)}
                    aria-label="Select all prompts matching current filters"
                  />
                </TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Additional</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Approved by</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFiltered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="align-top pt-3">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={(v) => toggleRow(p.id, v === true)}
                      aria-label={`Select prompt ${p.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs">{stripStagePrefix(p.stage)}</TableCell>
                  <TableCell className="text-xs">{p.steps}</TableCell>
                  <TableCell className="text-xs max-w-[200px]">
                    {truncate(htmlToPlainText(p.question), 60)}
                  </TableCell>
                  <TableCell className="text-xs max-w-[260px]">
                    {truncate(htmlToPlainText(p.promptText))}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] text-muted-foreground">
                    {truncate(htmlToPlainText(p.additionalInput ?? "")) || "—"}
                  </TableCell>
                  <TableCell className="text-xs">{p.createdBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.approvedBy ?? "—"}
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            Showing {paginatedFiltered.length} of {filtered.length} matching prompts (page {currentPage} of{" "}
            {totalPages})
          </div>
        </>
      )}
    </div>
  );
};

export default AllPrompts;