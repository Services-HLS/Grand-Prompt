import { useMemo, useState } from "react";
import { usePrompts } from "@/context/PromptsContext";
import StatusBadge from "@/components/StatusBadge";
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

const ALL = "all";
const truncate = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n)}…` : s);

const AllPrompts = () => {
  const { prompts } = usePrompts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [employeeFilter, setEmployeeFilter] = useState<string>(ALL);

  const employees = useMemo(
    () => Array.from(new Set(prompts.map((p) => p.createdBy))),
    [prompts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prompts.filter((p) => {
      const matchesStatus = statusFilter === ALL || p.status === statusFilter;
      const matchesEmployee = employeeFilter === ALL || p.createdBy === employeeFilter;
      const matchesQuery =
        !q ||
        p.promptText.toLowerCase().includes(q) ||
        p.question.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q) ||
        p.steps.toLowerCase().includes(q);
      return matchesStatus && matchesEmployee && matchesQuery;
    });
  }, [prompts, search, statusFilter, employeeFilter]);

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
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No prompts match.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{p.stage}</TableCell>
                  <TableCell className="text-xs">{p.steps}</TableCell>
                  <TableCell className="text-xs max-w-[200px]">{truncate(p.question, 60)}</TableCell>
                  <TableCell className="text-xs max-w-[260px]">{truncate(p.promptText)}</TableCell>
                  <TableCell className="text-xs">{p.createdBy}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AllPrompts;