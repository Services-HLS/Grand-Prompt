// import { useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { usePrompts } from "@/context/PromptsContext";
// import StatusBadge from "@/components/StatusBadge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// type Filter = "all" | "pending" | "approved" | "rejected";

// const truncate = (s: string, n = 80) => (s.length > n ? `${s.slice(0, n)}…` : s);

// const MyPrompts = () => {
//   const { user } = useAuth();
//   const { prompts } = usePrompts();
//   const [filter, setFilter] = useState<Filter>("all");

//   const mine = useMemo(
//     () => prompts.filter((p) => p.employeeId === user?.email),
//     [prompts, user],
//   );
//   const filtered = useMemo(
//     () => (filter === "all" ? mine : mine.filter((p) => p.status === filter)),
//     [mine, filter],
//   );

//   return (
//     <div className="max-w-5xl mx-auto">
//       <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
//         <h1 className="text-2xl font-bold">My Prompts</h1>
//         <p className="text-sm opacity-90 mt-1">{mine.length} total submissions</p>
//       </header>

//       <div className="bg-card rounded-xl shadow-card p-4 mb-4 flex items-center justify-between">
//         <span className="text-sm text-muted-foreground">Filter by status</span>
//         <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All</SelectItem>
//             <SelectItem value="pending">Pending</SelectItem>
//             <SelectItem value="approved">Approved</SelectItem>
//             <SelectItem value="rejected">Rejected</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="bg-card rounded-xl shadow-card overflow-hidden">
//         {filtered.length === 0 ? (
//           <div className="p-8 text-center text-muted-foreground">No prompts to show.</div>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Stage</TableHead>
//                 <TableHead>Steps</TableHead>
//                 <TableHead>Question</TableHead>
//                 <TableHead>Prompt</TableHead>
//                 <TableHead>Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.map((p) => (
//                 <TableRow key={p.id}>
//                   <TableCell className="text-xs">{p.stage}</TableCell>
//                   <TableCell className="text-xs">{p.steps}</TableCell>
//                   <TableCell className="text-xs max-w-[200px]">{truncate(p.question, 60)}</TableCell>
//                   <TableCell className="text-xs max-w-[280px]">{truncate(p.promptText)}</TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       <StatusBadge status={p.status} />
//                       {p.status === "rejected" && p.rejectionReason && (
//                         <p className="text-xs text-destructive max-w-[220px]">
//                           Reason: {p.rejectionReason}
//                         </p>
//                       )}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyPrompts;

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePrompts } from "@/context/PromptsContext";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, XCircle, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
import RichTextEditor from "@/components/RichTextEditor";

type Filter = "all" | "pending" | "approved" | "rejected";

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

const hasAdditionalInput = (additional?: string) =>
  htmlToPlainText(additional ?? "").length > 0;

const MyPrompts = () => {
  const { user } = useAuth();
  const { prompts } = usePrompts();
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Get current user's prompts
  const myPrompts = useMemo(
    () => prompts.filter((p) => p.employeeId === user?.email),
    [prompts, user]
  );

  // Stats for current user
  const stats = useMemo(() => {
    const pending = myPrompts.filter((p) => p.status === "pending").length;
    const approved = myPrompts.filter((p) => p.status === "approved").length;
    const rejected = myPrompts.filter((p) => p.status === "rejected").length;
    return { total: myPrompts.length, pending, approved, rejected };
  }, [myPrompts]);

  const filtered = useMemo(
    () => (filter === "all" ? myPrompts : myPrompts.filter((p) => p.status === filter)),
    [myPrompts, filter]
  );

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-card rounded-xl shadow-card p-8 text-center">
          <p className="text-muted-foreground">Please log in to view your prompts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">My Prompts</h1>
        <p className="text-sm opacity-90 mt-1">
          Manage your submitted prompts • {stats.total} total submissions
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Submitted</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Your Submissions</CardTitle>
            <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({stats.total})</SelectItem>
                <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
                <SelectItem value="approved">Approved ({stats.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({stats.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <p>You haven't submitted any prompts yet.</p>
              <Button variant="link" className="mt-2" onClick={() => (window.location.href = "/post")}>
                Post your first prompt →
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={cn("text-xs", stageBadgeClass(p.stage))}>
                      {p.stage}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {p.steps}
                    </Badge>
                    <StatusBadge status={p.status} />
                  </div>

                  <p className="font-medium text-sm mb-1">
                    📌 {p.question.length > 100 ? p.question.substring(0, 100) + "..." : p.question}
                  </p>

                  <div className="text-sm text-muted-foreground mb-2 space-y-2">
                    {expandedId === p.id ? (
                      <div className="space-y-3 mt-1">
                        <div>
                          <p className="font-medium text-foreground text-xs mb-1.5">Prompt</p>
                          <div className="border border-border rounded-lg p-3 bg-card">
                            <RichTextEditor
                              value={p.promptText}
                              onChange={() => {}}
                              readOnly
                              className="min-h-[120px]"
                            />
                          </div>
                        </div>
                        {hasAdditionalInput(p.additionalInput) ? (
                          <div>
                            <p className="font-medium text-foreground text-xs mb-1.5">Additional input</p>
                            <div className="border border-border rounded-lg p-3 bg-card">
                              <RichTextEditor
                                value={p.additionalInput ?? ""}
                                onChange={() => {}}
                                readOnly
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic border border-dashed border-border rounded-lg px-3 py-2">
                            No additional input for this submission.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-foreground">Prompt</p>
                          <p className="line-clamp-2 text-sm">
                            {htmlToPlainText(p.promptText)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">Additional input</p>
                          <p className="line-clamp-2 text-sm">
                            {hasAdditionalInput(p.additionalInput)
                              ? htmlToPlainText(p.additionalInput ?? "")
                              : "—"}
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 px-2 text-xs"
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {expandedId === p.id ? "Show less" : "Show more"}
                    </Button>
                  </div>

                  {p.status === "rejected" && p.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <strong>Rejection reason:</strong> {p.rejectionReason}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Submitted: {new Date(p.submittedAt).toLocaleString()}
                    {p.approvedAt && ` • Reviewed: ${new Date(p.approvedAt).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPrompts;