import { useMemo } from "react";
import { usePrompts } from "@/context/PromptsContext";

const Stat = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
  <div className="bg-card rounded-xl shadow-card p-5 text-center">
    <div className={`text-3xl font-bold ${accent}`}>{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

const Analytics = () => {
  const { prompts } = usePrompts();

  const stats = useMemo(() => {
    const total = prompts.length;
    const pending = prompts.filter((p) => p.status === "pending").length;
    const approved = prompts.filter((p) => p.status === "approved").length;
    const rejected = prompts.filter((p) => p.status === "rejected").length;
    const totalLikes = prompts.reduce((s, p) => s + p.likes, 0);
    const totalDislikes = prompts.reduce((s, p) => s + p.dislikes, 0);
    const reviewed = approved + rejected;
    const approvalRate = reviewed ? Math.round((approved / reviewed) * 100) : 0;
    return { total, pending, approved, rejected, totalLikes, totalDislikes, approvalRate };
  }, [prompts]);

  const byEmployee = useMemo(() => {
    const map = new Map<string, { total: number; approved: number; rejected: number; pending: number }>();
    prompts.forEach((p) => {
      const cur = map.get(p.createdBy) ?? { total: 0, approved: 0, rejected: 0, pending: 0 };
      cur.total += 1;
      cur[p.status] += 1;
      map.set(p.createdBy, cur);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [prompts]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm opacity-90 mt-1">Approval workflow & engagement overview</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total prompts" value={stats.total} accent="text-foreground" />
        <Stat label="Pending" value={stats.pending} accent="text-yellow-600" />
        <Stat label="Approved" value={stats.approved} accent="text-like" />
        <Stat label="Rejected" value={stats.rejected} accent="text-dislike" />
        <Stat label="Approval rate" value={stats.approvalRate} accent="text-foreground" />
        <Stat label="Total likes" value={stats.totalLikes} accent="text-like" />
        <Stat label="Total dislikes" value={stats.totalDislikes} accent="text-dislike" />
      </div>

      <div className="bg-card rounded-xl shadow-card p-5">
        <h2 className="text-lg font-semibold mb-4">By contributor</h2>
        {byEmployee.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {byEmployee.map(([name, s]) => (
              <div key={name} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.total} total · <span className="text-like">{s.approved} approved</span> ·{" "}
                  <span className="text-yellow-600">{s.pending} pending</span> ·{" "}
                  <span className="text-dislike">{s.rejected} rejected</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;