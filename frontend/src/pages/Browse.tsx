import { useEffect, useMemo, useState } from "react";
import { ThumbsDown, ThumbsUp, MessageCircle, SquareArrowOutUpRight } from "lucide-react";
import { usePrompts } from "@/context/PromptsContext";
import { useCategory } from "@/context/CategoryContext";
import { useAuth } from "@/context/AuthContext";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
import PromptDetailDialog from "@/components/PromptDetailDialog";
import { Prompt } from "@/data/prompts";

type Reaction = "like" | "dislike";
const STORAGE_KEY = "grant-prompts-reactions";
const ALL_STAGES = "all";
const ALL_STEPS = "all";

const RenderPromptCell = ({ html }: { html: string }) => {
  if (!html) return <span>No content</span>;
  
  return (
    <span 
      className="rich-prompt-cell"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const Browse = () => {
  const { user } = useAuth();
  const { prompts: allPrompts, updateLikes, updateDislikes, addFeedback, getFeedbacks, updatePrompt } = usePrompts();
  const { currentCategory, getCategoryPrompts } = useCategory();

  const [userReactions, setUserReactions] = useState<Record<number, Reaction>>({});
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);
  const [stepsFilter, setStepsFilter] = useState<string>(ALL_STEPS);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categoryPrompts = useMemo(() => {
    const categorySpecific = getCategoryPrompts();
    // return categorySpecific.filter(p => p.status === "approved");
    return categorySpecific;
  }, [currentCategory, getCategoryPrompts]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserReactions(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Record<number, Reaction>) => {
    setUserReactions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const visible = categoryPrompts;

  const handleLike = (id: number) => {
    const current = userReactions[id];
    if (current === "like") {
      updateLikes(id, -1);
      const next = { ...userReactions };
      delete next[id];
      persist(next);
    } else if (current === "dislike") {
      updateLikes(id, 1);
      updateDislikes(id, -1);
      persist({ ...userReactions, [id]: "like" });
    } else {
      updateLikes(id, 1);
      persist({ ...userReactions, [id]: "like" });
    }
  };

  const handleDislike = (id: number) => {
    const current = userReactions[id];
    if (current === "dislike") {
      updateDislikes(id, -1);
      const next = { ...userReactions };
      delete next[id];
      persist(next);
    } else if (current === "like") {
      updateDislikes(id, 1);
      updateLikes(id, -1);
      persist({ ...userReactions, [id]: "dislike" });
    } else {
      updateDislikes(id, 1);
      persist({ ...userReactions, [id]: "dislike" });
    }
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDialogOpen(true);
  };

  const handleSaveFeedback = async (promptId: number, feedback: string) => {
    if (user) {
      addFeedback(promptId, feedback, user.email, user.name);
    }
  };

  const handleEditPrompt = async (promptId: number, updates: Partial<Prompt>) => {
    console.log("Updating prompt with:", updates);
    updatePrompt(promptId, updates);
  };

  const stages = useMemo(() => Array.from(new Set(visible.map((p) => p.stage))), [visible]);
  const steps = useMemo(() => Array.from(new Set(visible.map((p) => p.steps))), [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visible.filter((p) => {
      const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
      const matchesSteps = stepsFilter === ALL_STEPS || p.steps === stepsFilter;
      const plainText = p.promptText.replace(/<[^>]*>/g, '');
      const matchesQuery = !q || plainText.toLowerCase().includes(q);
      return matchesStage && matchesSteps && matchesQuery;
    });
  }, [visible, search, stageFilter, stepsFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, stepsFilter]);

  const totalLikes = visible.reduce((s, p) => s + p.likes, 0);
  const totalDislikes = visible.reduce((s, p) => s + p.dislikes, 0);
  const existingFeedbacks = selectedPrompt ? getFeedbacks(selectedPrompt.id) : [];

  // Helper function to get feedback count for a prompt
  const getFeedbackCount = (promptId: number) => {
    const feedbacks = getFeedbacks(promptId);
    return feedbacks.length;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 text-center mb-6 shadow-card">
        <h1 className="text-2xl font-bold mb-1">
          {currentCategory.icon} {currentCategory.name} Prompts
        </h1>
        <p className="text-sm opacity-90">
          {visible.length} approved prompts • {currentCategory.description}
        </p>
      </header>

      <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder="Search prompts..."
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
              <SelectItem key={s} value={s}>{s}</SelectItem>
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
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center text-muted-foreground shadow-card">
          No prompts match your search.
        </div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[120px]">Stage</TableHead>
                  <TableHead className="w-[100px]">Steps</TableHead>
                  <TableHead className="w-[200px]">Question addressed</TableHead>
                  <TableHead>Prompt </TableHead>
                  <TableHead className="w-[120px]">Created by</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPrompts.map((p) => {
                  const liked = userReactions[p.id] === "like";
                  const disliked = userReactions[p.id] === "dislike";
                  const feedbackCount = getFeedbackCount(p.id);

                  return (
                    <TableRow
                      key={p.id}
                      className="align-top cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handlePromptClick(p)}
                    >
                      <TableCell className="align-top">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
                          {p.stage}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
                          {p.steps}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm italic text-muted-foreground align-top">
                        📌 {p.question.length > 70 ? p.question.substring(0, 70) + "..." : p.question}
                      </TableCell>
                      <TableCell className="text-sm text-foreground align-top">
                        <div className="group/prompt relative line-clamp-2 max-w-[350px] pr-6">
                          <RenderPromptCell html={p.promptText} />
                          <SquareArrowOutUpRight
                            className="w-4 h-4 text-muted-foreground absolute top-0 right-0 opacity-0 transition-opacity group-hover/prompt:opacity-100"
                            aria-hidden="true"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium align-top">{p.createdBy}</TableCell>
                      <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleLike(p.id)}
                            aria-pressed={liked}
                            aria-label="Like prompt"
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
                              liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                            )}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{p.likes}</span>
                          </button>
                          <button
                            onClick={() => handleDislike(p.id)}
                            aria-pressed={disliked}
                            aria-label="Dislike prompt"
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
                              disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                            )}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{p.dislikes}</span>
                          </button>
                          <button
                            onClick={() => handlePromptClick(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{feedbackCount}</span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards view */}
          <div className="md:hidden space-y-3">
            {paginatedPrompts.map((p) => {
              const liked = userReactions[p.id] === "like";
              const disliked = userReactions[p.id] === "dislike";
              const feedbackCount = getFeedbackCount(p.id);

              return (
                <article
                  key={p.id}
                  className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handlePromptClick(p)}
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
                      {p.stage}
                    </span>
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
                      {p.steps}
                    </span>
                  </div>
                  <p className="italic text-muted-foreground mb-3 text-sm">
                    📌 {p.question.length > 70 ? p.question.substring(0, 70) + "..." : p.question}
                  </p>

                  <div className="group/prompt bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
                    <div className="relative line-clamp-2 pr-6">
                      <RenderPromptCell html={p.promptText} />
                      <SquareArrowOutUpRight
                        className="w-4 h-4 text-muted-foreground absolute top-0 right-0 opacity-0 transition-opacity group-hover/prompt:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Created by <span className="font-medium text-foreground">{p.createdBy}</span>
                    </p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleLike(p.id)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
                          liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{p.likes}</span>
                      </button>
                      <button
                        onClick={() => handleDislike(p.id)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
                          disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                        )}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{p.dislikes}</span>
                      </button>
                      <button
                        onClick={() => handlePromptClick(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{feedbackCount}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                    className={cn(
                      "w-9",
                      currentPage === page && "bg-primary text-primary-foreground"
                    )}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Results count */}
          <div className="text-center text-xs text-muted-foreground mt-4">
            Showing {paginatedPrompts.length} of {filtered.length} prompts
          </div>
        </>
      )}

      <footer className="bg-card rounded-xl p-5 mt-6 shadow-card flex items-center justify-around text-center">
        <div>
          <div className="text-2xl font-bold text-like">👍 {totalLikes}</div>
          <div className="text-xs text-muted-foreground mt-1">Total likes</div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <div className="text-2xl font-bold text-dislike">👎 {totalDislikes}</div>
          <div className="text-xs text-muted-foreground mt-1">Total dislikes</div>
        </div>
      </footer>

      <PromptDetailDialog
        prompt={selectedPrompt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaveFeedback={handleSaveFeedback}
        onEditPrompt={handleEditPrompt}
        existingFeedbacks={existingFeedbacks.map(f => ({
          id: f.id,
          userName: f.userName,
          feedback: f.feedback,
          createdAt: f.createdAt
        }))}
        userRole={user?.role}
        userName={user?.name}
      />
    </div>
  );
};

export default Browse;


// import { useEffect, useMemo, useState } from "react";
// import { ThumbsDown, ThumbsUp } from "lucide-react";
// import { usePrompts } from "@/context/PromptsContext";
// import { useCategory } from "@/context/CategoryContext";
// import { useAuth } from "@/context/AuthContext";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
// import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
// import PromptDetailDialog from "@/components/PromptDetailDialog";
// import { Prompt } from "@/data/prompts";

// type Reaction = "like" | "dislike";
// const STORAGE_KEY = "grant-prompts-reactions";
// const ALL_STAGES = "all";


// const RenderPromptCell = ({ html }: { html: string }) => {
//   if (!html) return <span>No content</span>;
  
//   // For table cell - render HTML directly, let CSS handle the 2-line clamp
//   return (
//     <span 
//       className="rich-prompt-cell"
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   );
// };

// const Browse = () => {
//   const { user } = useAuth();
//   const { prompts: allPrompts, updateLikes, updateDislikes, addFeedback, getFeedbacks, updatePrompt } = usePrompts();
//   const { currentCategory, getCategoryPrompts } = useCategory();

//   const [userReactions, setUserReactions] = useState<Record<number, Reaction>>({});
//   const [search, setSearch] = useState("");
//   const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);
//   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const categoryPrompts = useMemo(() => {
//     const categorySpecific = getCategoryPrompts();
//     return categorySpecific.filter(p => p.status === "approved");
//   }, [currentCategory, getCategoryPrompts]);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) setUserReactions(JSON.parse(raw));
//     } catch {
//       /* ignore */
//     }
//   }, []);

//   const persist = (next: Record<number, Reaction>) => {
//     setUserReactions(next);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
//     } catch {
//       /* ignore */
//     }
//   };

//   const visible = categoryPrompts;

//   const handleLike = (id: number) => {
//     const current = userReactions[id];
//     if (current === "like") {
//       updateLikes(id, -1);
//       const next = { ...userReactions };
//       delete next[id];
//       persist(next);
//     } else if (current === "dislike") {
//       updateLikes(id, 1);
//       updateDislikes(id, -1);
//       persist({ ...userReactions, [id]: "like" });
//     } else {
//       updateLikes(id, 1);
//       persist({ ...userReactions, [id]: "like" });
//     }
//   };

//   const handleDislike = (id: number) => {
//     const current = userReactions[id];
//     if (current === "dislike") {
//       updateDislikes(id, -1);
//       const next = { ...userReactions };
//       delete next[id];
//       persist(next);
//     } else if (current === "like") {
//       updateDislikes(id, 1);
//       updateLikes(id, -1);
//       persist({ ...userReactions, [id]: "dislike" });
//     } else {
//       updateDislikes(id, 1);
//       persist({ ...userReactions, [id]: "dislike" });
//     }
//   };

//   const handlePromptClick = (prompt: Prompt) => {
//     setSelectedPrompt(prompt);
//     setIsDialogOpen(true);
//   };

//   const handleSaveFeedback = async (promptId: number, feedback: string) => {
//     if (user) {
//       addFeedback(promptId, feedback, user.email, user.name);
//     }
//   };

//   const handleEditPrompt = async (promptId: number, updates: Partial<Prompt>) => {
//     console.log("Updating prompt with:", updates);
//     updatePrompt(promptId, updates);
//   };

//   const stages = useMemo(() => Array.from(new Set(visible.map((p) => p.stage))), [visible]);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return visible.filter((p) => {
//       const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
//       const plainText = p.promptText.replace(/<[^>]*>/g, '');
//       const matchesQuery = !q || plainText.toLowerCase().includes(q) || p.question.toLowerCase().includes(q);
//       return matchesStage && matchesQuery;
//     });
//   }, [visible, search, stageFilter]);

//   const totalLikes = visible.reduce((s, p) => s + p.likes, 0);
//   const totalDislikes = visible.reduce((s, p) => s + p.dislikes, 0);
//   const existingFeedbacks = selectedPrompt ? getFeedbacks(selectedPrompt.id) : [];

//   return (
//     <div className="max-w-6xl mx-auto">
//       <header className="bg-gradient-header text-white rounded-2xl p-6 text-center mb-6 shadow-card">
//         <h1 className="text-2xl font-bold mb-1">
//           {currentCategory.icon} {currentCategory.name} Prompts
//         </h1>
//         <p className="text-sm opacity-90">
//           {visible.length} approved prompts • {currentCategory.description}
//         </p>
//       </header>

//       <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
//         <Input
//           type="search"
//           placeholder="Search prompts..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1"
//         />
//         <Select value={stageFilter} onValueChange={setStageFilter}>
//           <SelectTrigger className="sm:w-[240px]">
//             <SelectValue placeholder="All Stages" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value={ALL_STAGES}>All Stages</SelectItem>
//             {stages.map((s) => (
//               <SelectItem key={s} value={s}>{s}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </section>

//       {filtered.length === 0 ? (
//         <div className="bg-card rounded-xl p-8 text-center text-muted-foreground shadow-card">
//           No prompts match your search.
//         </div>
//       ) : (
//         <>
//           {/* Desktop table view */}
//           <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/40 hover:bg-muted/40">
//                   <TableHead className="w-[150px]">Stage</TableHead>
//                   <TableHead className="w-[140px]">Steps</TableHead>
//                   <TableHead className="w-[220px]">Question addressed</TableHead>
//                   <TableHead>Prompt (max 2 lines)</TableHead>
//                   <TableHead className="w-[130px]">Created by</TableHead>
//                   <TableHead className="w-[150px] text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filtered.map((p) => {
//                   const liked = userReactions[p.id] === "like";
//                   const disliked = userReactions[p.id] === "dislike";

//                   return (
//                     <TableRow
//                       key={p.id}
//                       className="align-top cursor-pointer hover:bg-muted/50 transition-colors"
//                       onClick={() => handlePromptClick(p)}
//                     >
//                       <TableCell className="align-top">
//                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
//                           {p.stage}
//                         </span>
//                       </TableCell>
//                       <TableCell className="align-top">
//                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
//                           {p.steps}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-sm italic text-muted-foreground align-top">
//                         📌 {p.question.length > 80 ? p.question.substring(0, 80) + "..." : p.question}
//                       </TableCell>
//                       <TableCell className="text-sm text-foreground align-top">
//                         <div className="line-clamp-2 overflow-hidden text-ellipsis max-w-[400px]">
//                           <RenderPromptCell html={p.promptText} />
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm font-medium align-top">{p.createdBy}</TableCell>
//                       <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() => handleLike(p.id)}
//                             aria-pressed={liked}
//                             aria-label="Like prompt"
//                             className={cn(
//                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                               liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                             )}
//                           >
//                             <ThumbsUp className="w-3.5 h-3.5" />
//                             <span>{p.likes}</span>
//                           </button>
//                           <button
//                             onClick={() => handleDislike(p.id)}
//                             aria-pressed={disliked}
//                             aria-label="Dislike prompt"
//                             className={cn(
//                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                               disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                             )}
//                           >
//                             <ThumbsDown className="w-3.5 h-3.5" />
//                             <span>{p.dislikes}</span>
//                           </button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Mobile cards view */}
//           <div className="md:hidden space-y-3">
//             {filtered.map((p) => {
//               const liked = userReactions[p.id] === "like";
//               const disliked = userReactions[p.id] === "dislike";

//               return (
//                 <article
//                   key={p.id}
//                   className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-all"
//                   onClick={() => handlePromptClick(p)}
//                 >
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
//                       {p.stage}
//                     </span>
//                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
//                       {p.steps}
//                     </span>
//                   </div>
//                   <p className="italic text-muted-foreground mb-3 text-sm">
//                     📌 {p.question.length > 70 ? p.question.substring(0, 70) + "..." : p.question}
//                   </p>

//                   <div className="bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
//                     <div className="line-clamp-2 overflow-hidden text-ellipsis">
//                       <RenderPromptCell html={p.promptText} />
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <p className="text-xs text-muted-foreground">
//                       Created by <span className="font-medium text-foreground">{p.createdBy}</span>
//                     </p>
//                     <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
//                       <button
//                         onClick={() => handleLike(p.id)}
//                         className={cn(
//                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                           liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                         )}
//                       >
//                         <ThumbsUp className="w-3.5 h-3.5" />
//                         <span>{p.likes}</span>
//                       </button>
//                       <button
//                         onClick={() => handleDislike(p.id)}
//                         className={cn(
//                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                           disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                         )}
//                       >
//                         <ThumbsDown className="w-3.5 h-3.5" />
//                         <span>{p.dislikes}</span>
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </>
//       )}

//       <footer className="bg-card rounded-xl p-5 mt-6 shadow-card flex items-center justify-around text-center">
//         <div>
//           <div className="text-2xl font-bold text-like">👍 {totalLikes}</div>
//           <div className="text-xs text-muted-foreground mt-1">Total likes</div>
//         </div>
//         <div className="w-px h-10 bg-border" />
//         <div>
//           <div className="text-2xl font-bold text-dislike">👎 {totalDislikes}</div>
//           <div className="text-xs text-muted-foreground mt-1">Total dislikes</div>
//         </div>
//       </footer>

//       <PromptDetailDialog
//         prompt={selectedPrompt}
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         onSaveFeedback={handleSaveFeedback}
//         onEditPrompt={handleEditPrompt}
//         existingFeedbacks={existingFeedbacks.map(f => ({
//           id: f.id,
//           userName: f.userName,
//           feedback: f.feedback,
//           createdAt: f.createdAt
//         }))}
//         userRole={user?.role}
//         userName={user?.name}
//       />
//     </div>
//   );
// };

// export default Browse;


// import { useEffect, useMemo, useState } from "react";
// import { ThumbsDown, ThumbsUp } from "lucide-react";
// import { usePrompts } from "@/context/PromptsContext";
// import { useCategory } from "@/context/CategoryContext";
// import { useAuth } from "@/context/AuthContext";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { cn } from "@/lib/utils";
// import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
// import PromptDetailDialog from "@/components/PromptDetailDialog";
// import { Prompt } from "@/data/prompts";

// type Reaction = "like" | "dislike";
// const STORAGE_KEY = "grant-prompts-reactions";
// const ALL_STAGES = "all";

// // Helper function to truncate text to 2 lines
// const truncateToTwoLines = (text: string, maxLength: number = 120) => {
//   // First, strip HTML tags if any (for rich text)
//   const plainText = text.replace(/<[^>]*>/g, '');

//   if (plainText.length <= maxLength) {
//     return plainText;
//   }

//   // Find a good break point (end of sentence or word)
//   let truncated = plainText.substring(0, maxLength);
//   const lastSpace = truncated.lastIndexOf(' ');
//   const lastPeriod = truncated.lastIndexOf('.');
//   const lastNewLine = truncated.lastIndexOf('\n');

//   const breakPoint = Math.max(lastSpace, lastPeriod, lastNewLine);

//   if (breakPoint > maxLength / 2) {
//     truncated = truncated.substring(0, breakPoint);
//   }

//   return truncated + '...';
// };

// const Browse = () => {
//   const { user } = useAuth();
//   // const { prompts: allPrompts, updateLikes, updateDislikes, addFeedback, getFeedbacks } = usePrompts();
//   const { prompts: allPrompts, updateLikes, updateDislikes, addFeedback, getFeedbacks, updatePrompt } = usePrompts();
//   const { currentCategory, getCategoryPrompts } = useCategory();

//   const [userReactions, setUserReactions] = useState<Record<number, Reaction>>({});
//   const [search, setSearch] = useState("");
//   const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);
//   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const categoryPrompts = useMemo(() => {
//     const categorySpecific = getCategoryPrompts();
//     return categorySpecific.filter(p => p.status === "approved");
//   }, [currentCategory, getCategoryPrompts]);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) setUserReactions(JSON.parse(raw));
//     } catch {
//       /* ignore */
//     }
//   }, []);

//   const persist = (next: Record<number, Reaction>) => {
//     setUserReactions(next);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
//     } catch {
//       /* ignore */
//     }
//   };

//   const visible = categoryPrompts;

//   const handleLike = (id: number) => {
//     const current = userReactions[id];
//     if (current === "like") {
//       updateLikes(id, -1);
//       const next = { ...userReactions };
//       delete next[id];
//       persist(next);
//     } else if (current === "dislike") {
//       updateLikes(id, 1);
//       updateDislikes(id, -1);
//       persist({ ...userReactions, [id]: "like" });
//     } else {
//       updateLikes(id, 1);
//       persist({ ...userReactions, [id]: "like" });
//     }
//   };

//   const handleDislike = (id: number) => {
//     const current = userReactions[id];
//     if (current === "dislike") {
//       updateDislikes(id, -1);
//       const next = { ...userReactions };
//       delete next[id];
//       persist(next);
//     } else if (current === "like") {
//       updateDislikes(id, 1);
//       updateLikes(id, -1);
//       persist({ ...userReactions, [id]: "dislike" });
//     } else {
//       updateDislikes(id, 1);
//       persist({ ...userReactions, [id]: "dislike" });
//     }
//   };

//   const handlePromptClick = (prompt: Prompt) => {
//     setSelectedPrompt(prompt);
//     setIsDialogOpen(true);
//   };

//   const handleSaveFeedback = async (promptId: number, feedback: string) => {
//     if (user) {
//       addFeedback(promptId, feedback, user.email, user.name);
//     }
//   };

//   const handleEditPrompt = async (promptId: number, updates: Partial<Prompt>) => {
//     updatePrompt(promptId, updates);
//   };

//   const stages = useMemo(() => Array.from(new Set(visible.map((p) => p.stage))), [visible]);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return visible.filter((p) => {
//       const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
//       const matchesQuery =
//         !q ||
//         p.promptText.toLowerCase().includes(q) ||
//         p.question.toLowerCase().includes(q);
//       return matchesStage && matchesQuery;
//     });
//   }, [visible, search, stageFilter]);

//   const totalLikes = visible.reduce((s, p) => s + p.likes, 0);
//   const totalDislikes = visible.reduce((s, p) => s + p.dislikes, 0);

//   const existingFeedbacks = selectedPrompt ? getFeedbacks(selectedPrompt.id) : [];

//   return (
//     <div className="max-w-6xl mx-auto">
//       <header className="bg-gradient-header text-white rounded-2xl p-6 text-center mb-6 shadow-card">
//         <h1 className="text-2xl font-bold mb-1">
//           {currentCategory.icon} {currentCategory.name} Prompts
//         </h1>
//         <p className="text-sm opacity-90">
//           {visible.length} approved prompts • {currentCategory.description}
//         </p>
//       </header>

//       <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
//         <Input
//           type="search"
//           placeholder="Search prompts..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1"
//         />
//         <Select value={stageFilter} onValueChange={setStageFilter}>
//           <SelectTrigger className="sm:w-[240px]">
//             <SelectValue placeholder="All Stages" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value={ALL_STAGES}>All Stages</SelectItem>
//             {stages.map((s) => (
//               <SelectItem key={s} value={s}>{s}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </section>

//       {filtered.length === 0 ? (
//         <div className="bg-card rounded-xl p-8 text-center text-muted-foreground shadow-card">
//           No prompts match your search.
//         </div>
//       ) : (
//         <>
//           {/* Desktop table view */}
//           <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/40 hover:bg-muted/40">
//                   <TableHead className="w-[150px]">Stage</TableHead>
//                   <TableHead className="w-[140px]">Steps</TableHead>
//                   <TableHead className="w-[220px]">Question addressed</TableHead>
//                   <TableHead>Prompt (max 2 lines)</TableHead>
//                   <TableHead className="w-[130px]">Created by</TableHead>
//                   <TableHead className="w-[150px] text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filtered.map((p) => {
//                   const liked = userReactions[p.id] === "like";
//                   const disliked = userReactions[p.id] === "dislike";
//                   // Truncate prompt to approximately 2 lines (around 100-120 characters)
//                   const truncatedPrompt = truncateToTwoLines(p.promptText, 110);

//                   return (
//                     <TableRow
//                       key={p.id}
//                       className="align-top cursor-pointer hover:bg-muted/50 transition-colors"
//                       onClick={() => handlePromptClick(p)}
//                     >
//                       <TableCell className="align-top">
//                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
//                           {p.stage}
//                         </span>
//                       </TableCell>
//                       <TableCell className="align-top">
//                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
//                           {p.steps}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-sm italic text-muted-foreground align-top">
//                         📌 {p.question.length > 80 ? p.question.substring(0, 80) + "..." : p.question}
//                       </TableCell>
//                       {/* 2-LINE FREEZE - Fixed height with line clamping */}
//                       <TableCell className="text-sm text-foreground align-top">
//                         <div className="line-clamp-2 overflow-hidden text-ellipsis max-w-[400px]">
//                           {truncatedPrompt}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm font-medium align-top">{p.createdBy}</TableCell>
//                       <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex justify-end gap-2">
//                           <button
//                             onClick={() => handleLike(p.id)}
//                             aria-pressed={liked}
//                             aria-label="Like prompt"
//                             className={cn(
//                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                               liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                             )}
//                           >
//                             <ThumbsUp className="w-3.5 h-3.5" />
//                             <span>{p.likes}</span>
//                           </button>
//                           <button
//                             onClick={() => handleDislike(p.id)}
//                             aria-pressed={disliked}
//                             aria-label="Dislike prompt"
//                             className={cn(
//                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                               disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                             )}
//                           >
//                             <ThumbsDown className="w-3.5 h-3.5" />
//                             <span>{p.dislikes}</span>
//                           </button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Mobile cards view - also 2-line freeze */}
//           <div className="md:hidden space-y-3">
//             {filtered.map((p) => {
//               const liked = userReactions[p.id] === "like";
//               const disliked = userReactions[p.id] === "dislike";
//               const truncatedPrompt = truncateToTwoLines(p.promptText, 100);

//               return (
//                 <article
//                   key={p.id}
//                   className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-all"
//                   onClick={() => handlePromptClick(p)}
//                 >
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
//                       {p.stage}
//                     </span>
//                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
//                       {p.steps}
//                     </span>
//                   </div>
//                   <p className="italic text-muted-foreground mb-3 text-sm">📌 {p.question.length > 70 ? p.question.substring(0, 70) + "..." : p.question}</p>

//                   {/* 2-LINE FREEZE for mobile */}
//                   <div className="bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
//                     <div className="line-clamp-2 overflow-hidden text-ellipsis">
//                       {truncatedPrompt}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <p className="text-xs text-muted-foreground">
//                       Created by <span className="font-medium text-foreground">{p.createdBy}</span>
//                     </p>
//                     <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
//                       <button
//                         onClick={() => handleLike(p.id)}
//                         className={cn(
//                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                           liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                         )}
//                       >
//                         <ThumbsUp className="w-3.5 h-3.5" />
//                         <span>{p.likes}</span>
//                       </button>
//                       <button
//                         onClick={() => handleDislike(p.id)}
//                         className={cn(
//                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
//                           disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
//                         )}
//                       >
//                         <ThumbsDown className="w-3.5 h-3.5" />
//                         <span>{p.dislikes}</span>
//                       </button>
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </>
//       )}

//       <footer className="bg-card rounded-xl p-5 mt-6 shadow-card flex items-center justify-around text-center">
//         <div>
//           <div className="text-2xl font-bold text-like">👍 {totalLikes}</div>
//           <div className="text-xs text-muted-foreground mt-1">Total likes</div>
//         </div>
//         <div className="w-px h-10 bg-border" />
//         <div>
//           <div className="text-2xl font-bold text-dislike">👎 {totalDislikes}</div>
//           <div className="text-xs text-muted-foreground mt-1">Total dislikes</div>
//         </div>
//       </footer>

//       <PromptDetailDialog
//         prompt={selectedPrompt}
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         onSaveFeedback={handleSaveFeedback}
//          onEditPrompt={handleEditPrompt}  
//         existingFeedbacks={existingFeedbacks.map(f => ({
//           id: f.id,
//           userName: f.userName,
//           feedback: f.feedback,
//           createdAt: f.createdAt
//         }))}
//         userRole={user?.role}
//         userName={user?.name}
//       />
//     </div>
//   );
// };

// export default Browse;


// // // import { useEffect, useMemo, useState } from "react";
// // // import { ThumbsDown, ThumbsUp } from "lucide-react";
// // // import { usePrompts } from "@/context/PromptsContext";
// // // import { useCategory } from "@/context/CategoryContext"; // Add this
// // // import { Input } from "@/components/ui/input";
// // // import {
// // //   Select,
// // //   SelectContent,
// // //   SelectItem,
// // //   SelectTrigger,
// // //   SelectValue,
// // // } from "@/components/ui/select";
// // // import {
// // //   Table,
// // //   TableBody,
// // //   TableCell,
// // //   TableHead,
// // //   TableHeader,
// // //   TableRow,
// // // } from "@/components/ui/table";
// // // import { cn } from "@/lib/utils";
// // // import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";

// // // type Reaction = "like" | "dislike";
// // // const STORAGE_KEY = "grant-prompts-reactions";
// // // const ALL_STAGES = "all";

// // // const Browse = () => {
// // //   const { prompts: allPrompts, updateLikes, updateDislikes } = usePrompts();
// // //   const { currentCategory, getCategoryPrompts } = useCategory(); // Add this

// // //   const [userReactions, setUserReactions] = useState<Record<number, Reaction>>({});
// // //   const [search, setSearch] = useState("");
// // //   const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);

// // //   // Get category-specific prompts (approved only)
// // //   const categoryPrompts = useMemo(() => {
// // //     const categorySpecific = getCategoryPrompts();
// // //     // Merge with existing prompts that match this category? 
// // //     // For now, use category-specific data
// // //     return categorySpecific.filter(p => p.status === "approved");
// // //   }, [currentCategory, getCategoryPrompts]);

// // //   useEffect(() => {
// // //     try {
// // //       const raw = localStorage.getItem(STORAGE_KEY);
// // //       if (raw) setUserReactions(JSON.parse(raw));
// // //     } catch {
// // //       /* ignore */
// // //     }
// // //   }, []);

// // //   const persist = (next: Record<number, Reaction>) => {
// // //     setUserReactions(next);
// // //     try {
// // //       localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
// // //     } catch {
// // //       /* ignore */
// // //     }
// // //   };

// // //   const visible = categoryPrompts; // Use category prompts instead of all prompts

// // //   const handleLike = (id: number) => {
// // //     const current = userReactions[id];
// // //     if (current === "like") {
// // //       updateLikes(id, -1);
// // //       const next = { ...userReactions };
// // //       delete next[id];
// // //       persist(next);
// // //     } else if (current === "dislike") {
// // //       updateLikes(id, 1);
// // //       updateDislikes(id, -1);
// // //       persist({ ...userReactions, [id]: "like" });
// // //     } else {
// // //       updateLikes(id, 1);
// // //       persist({ ...userReactions, [id]: "like" });
// // //     }
// // //   };

// // //   const handleDislike = (id: number) => {
// // //     const current = userReactions[id];
// // //     if (current === "dislike") {
// // //       updateDislikes(id, -1);
// // //       const next = { ...userReactions };
// // //       delete next[id];
// // //       persist(next);
// // //     } else if (current === "like") {
// // //       updateDislikes(id, 1);
// // //       updateLikes(id, -1);
// // //       persist({ ...userReactions, [id]: "dislike" });
// // //     } else {
// // //       updateDislikes(id, 1);
// // //       persist({ ...userReactions, [id]: "dislike" });
// // //     }
// // //   };

// // //   const stages = useMemo(() => Array.from(new Set(visible.map((p) => p.stage))), [visible]);

// // //   const filtered = useMemo(() => {
// // //     const q = search.trim().toLowerCase();
// // //     return visible.filter((p) => {
// // //       const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
// // //       const matchesQuery =
// // //         !q ||
// // //         p.promptText.toLowerCase().includes(q) ||
// // //         p.question.toLowerCase().includes(q);
// // //       return matchesStage && matchesQuery;
// // //     });
// // //   }, [visible, search, stageFilter]);

// // //   const totalLikes = visible.reduce((s, p) => s + p.likes, 0);
// // //   const totalDislikes = visible.reduce((s, p) => s + p.dislikes, 0);

// // //   return (
// // //     <div className="max-w-6xl mx-auto">
// // //       <header className="bg-gradient-header text-white rounded-2xl p-6 text-center mb-6 shadow-card">
// // //         <h1 className="text-2xl font-bold mb-1">
// // //           {currentCategory.icon} {currentCategory.name} Prompts
// // //         </h1>
// // //         <p className="text-sm opacity-90">
// // //           {visible.length} approved prompts • {currentCategory.description}
// // //         </p>
// // //       </header>

// // //       <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
// // //         <Input type="search" placeholder="Search prompts..." />
// // //         <Select value={stageFilter} onValueChange={setStageFilter}>  {/* Stage filter - different from category dropdown */}
// // //           <SelectTrigger className="sm:w-[240px]">
// // //             <SelectValue placeholder="All Stages" />
// // //           </SelectTrigger>
// // //           <SelectContent>
// // //             <SelectItem value="all">All Stages</SelectItem>
// // //             {stages.map((s) => (
// // //               <SelectItem key={s} value={s}>{s}</SelectItem>
// // //             ))}
// // //           </SelectContent>
// // //         </Select>
// // //       </section>

// // //       {/* Rest of your existing JSX remains the same */}
// // //       {filtered.length === 0 ? (
// // //         <div className="bg-card rounded-xl p-8 text-center text-muted-foreground shadow-card">
// // //           No prompts match your search.
// // //         </div>
// // //       ) : (
// // //         <>
// // //           {/* Desktop table view - keep your existing table code */}
// // //           <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
// // //             <Table>
// // //               <TableHeader>
// // //                 <TableRow className="bg-muted/40 hover:bg-muted/40">
// // //                   <TableHead className="w-[150px]">Stage</TableHead>
// // //                   <TableHead className="w-[140px]">Steps</TableHead>
// // //                   <TableHead className="w-[220px]">Question addressed</TableHead>
// // //                   <TableHead>Prompt</TableHead>
// // //                   <TableHead className="w-[130px]">Created by</TableHead>
// // //                   <TableHead className="w-[150px] text-right">Actions</TableHead>
// // //                 </TableRow>
// // //               </TableHeader>
// // //               <TableBody>
// // //                 {filtered.map((p) => {
// // //                   const liked = userReactions[p.id] === "like";
// // //                   const disliked = userReactions[p.id] === "dislike";
// // //                   return (
// // //                     <TableRow key={p.id} className="align-top">
// // //                       <TableCell>
// // //                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
// // //                           {p.stage}
// // //                         </span>
// // //                       </TableCell>
// // //                       <TableCell>
// // //                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
// // //                           {p.steps}
// // //                         </span>
// // //                       </TableCell>
// // //                       <TableCell className="text-sm italic text-muted-foreground">
// // //                         📌 {p.question}
// // //                       </TableCell>
// // //                       <TableCell className="text-sm text-foreground leading-relaxed">
// // //                         {p.promptText}
// // //                       </TableCell>
// // //                       <TableCell className="text-sm font-medium">{p.createdBy}</TableCell>
// // //                       <TableCell>
// // //                         <div className="flex justify-end gap-2">
// // //                           <button
// // //                             onClick={() => handleLike(p.id)}
// // //                             aria-pressed={liked}
// // //                             className={cn(
// // //                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0",
// // //                               liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted",
// // //                             )}
// // //                           >
// // //                             <ThumbsUp className="w-3.5 h-3.5" />
// // //                             <span>{p.likes}</span>
// // //                           </button>
// // //                           <button
// // //                             onClick={() => handleDislike(p.id)}
// // //                             aria-pressed={disliked}
// // //                             className={cn(
// // //                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0",
// // //                               disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted",
// // //                             )}
// // //                           >
// // //                             <ThumbsDown className="w-3.5 h-3.5" />
// // //                             <span>{p.dislikes}</span>
// // //                           </button>
// // //                         </div>
// // //                       </TableCell>
// // //                     </TableRow>
// // //                   );
// // //                 })}
// // //               </TableBody>
// // //             </Table>
// // //           </div>

// // //           {/* Mobile cards view - keep your existing card code */}
// // //           <div className="md:hidden space-y-3">
// // //             {filtered.map((p) => {
// // //               const liked = userReactions[p.id] === "like";
// // //               const disliked = userReactions[p.id] === "dislike";
// // //               return (
// // //                 <article key={p.id} className="bg-card rounded-xl p-4 shadow-card">
// // //                   <div className="flex flex-wrap gap-2 mb-3">
// // //                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
// // //                       {p.stage}
// // //                     </span>
// // //                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
// // //                       {p.steps}
// // //                     </span>
// // //                   </div>
// // //                   <p className="italic text-muted-foreground mb-3 text-sm">📌 {p.question}</p>
// // //                   <div className="bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
// // //                     {p.promptText}
// // //                   </div>
// // //                   <div className="flex items-center justify-between">
// // //                     <p className="text-xs text-muted-foreground">
// // //                       Created by <span className="font-medium text-foreground">{p.createdBy}</span>
// // //                     </p>
// // //                     <div className="flex gap-2">
// // //                       <button
// // //                         onClick={() => handleLike(p.id)}
// // //                         className={cn(
// // //                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0",
// // //                           liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted",
// // //                         )}
// // //                       >
// // //                         <ThumbsUp className="w-3.5 h-3.5" />
// // //                         <span>{p.likes}</span>
// // //                       </button>
// // //                       <button
// // //                         onClick={() => handleDislike(p.id)}
// // //                         className={cn(
// // //                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0",
// // //                           disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted",
// // //                         )}
// // //                       >
// // //                         <ThumbsDown className="w-3.5 h-3.5" />
// // //                         <span>{p.dislikes}</span>
// // //                       </button>
// // //                     </div>
// // //                   </div>
// // //                 </article>
// // //               );
// // //             })}
// // //           </div>
// // //         </>
// // //       )}

// // //       <footer className="bg-card rounded-xl p-5 mt-6 shadow-card flex items-center justify-around text-center">
// // //         <div>
// // //           <div className="text-2xl font-bold text-like">👍 {totalLikes}</div>
// // //           <div className="text-xs text-muted-foreground mt-1">Total likes</div>
// // //         </div>
// // //         <div className="w-px h-10 bg-border" />
// // //         <div>
// // //           <div className="text-2xl font-bold text-dislike">👎 {totalDislikes}</div>
// // //           <div className="text-xs text-muted-foreground mt-1">Total dislikes</div>
// // //         </div>
// // //       </footer>
// // //     </div>
// // //   );
// // // };

// // // export default Browse;

// // import { useEffect, useMemo, useState } from "react";
// // import { ThumbsDown, ThumbsUp } from "lucide-react";
// // import { usePrompts } from "@/context/PromptsContext";
// // import { useCategory } from "@/context/CategoryContext";
// // import { useAuth } from "@/context/AuthContext";
// // import { Input } from "@/components/ui/input";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { cn } from "@/lib/utils";
// // import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
// // import PromptDetailDialog from "@/components/PromptDetailDialog";
// // import { Prompt } from "@/data/prompts";

// // type Reaction = "like" | "dislike";
// // const STORAGE_KEY = "grant-prompts-reactions";
// // const ALL_STAGES = "all";

// // const Browse = () => {
// //   const { user } = useAuth();
// //   const { prompts: allPrompts, updateLikes, updateDislikes, addFeedback, getFeedbacks } = usePrompts();
// //   const { currentCategory, getCategoryPrompts } = useCategory();

// //   const [userReactions, setUserReactions] = useState<Record<number, Reaction>>({});
// //   const [search, setSearch] = useState("");
// //   const [stageFilter, setStageFilter] = useState<string>(ALL_STAGES);
// //   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);

// //   const categoryPrompts = useMemo(() => {
// //     const categorySpecific = getCategoryPrompts();
// //     return categorySpecific.filter(p => p.status === "approved");
// //   }, [currentCategory, getCategoryPrompts]);

// //   useEffect(() => {
// //     try {
// //       const raw = localStorage.getItem(STORAGE_KEY);
// //       if (raw) setUserReactions(JSON.parse(raw));
// //     } catch {
// //       /* ignore */
// //     }
// //   }, []);

// //   const persist = (next: Record<number, Reaction>) => {
// //     setUserReactions(next);
// //     try {
// //       localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
// //     } catch {
// //       /* ignore */
// //     }
// //   };

// //   const visible = categoryPrompts;

// //   const handleLike = (id: number) => {
// //     const current = userReactions[id];
// //     if (current === "like") {
// //       updateLikes(id, -1);
// //       const next = { ...userReactions };
// //       delete next[id];
// //       persist(next);
// //     } else if (current === "dislike") {
// //       updateLikes(id, 1);
// //       updateDislikes(id, -1);
// //       persist({ ...userReactions, [id]: "like" });
// //     } else {
// //       updateLikes(id, 1);
// //       persist({ ...userReactions, [id]: "like" });
// //     }
// //   };

// //   const handleDislike = (id: number) => {
// //     const current = userReactions[id];
// //     if (current === "dislike") {
// //       updateDislikes(id, -1);
// //       const next = { ...userReactions };
// //       delete next[id];
// //       persist(next);
// //     } else if (current === "like") {
// //       updateDislikes(id, 1);
// //       updateLikes(id, -1);
// //       persist({ ...userReactions, [id]: "dislike" });
// //     } else {
// //       updateDislikes(id, 1);
// //       persist({ ...userReactions, [id]: "dislike" });
// //     }
// //   };

// //   const handlePromptClick = (prompt: Prompt) => {
// //     setSelectedPrompt(prompt);
// //     setIsDialogOpen(true);
// //   };

// //   const handleSaveFeedback = async (promptId: number, feedback: string) => {
// //     if (user) {
// //       addFeedback(promptId, feedback, user.email, user.name);
// //     }
// //   };

// //   const stages = useMemo(() => Array.from(new Set(visible.map((p) => p.stage))), [visible]);

// //   const filtered = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     return visible.filter((p) => {
// //       const matchesStage = stageFilter === ALL_STAGES || p.stage === stageFilter;
// //       const matchesQuery =
// //         !q ||
// //         p.promptText.toLowerCase().includes(q) ||
// //         p.question.toLowerCase().includes(q);
// //       return matchesStage && matchesQuery;
// //     });
// //   }, [visible, search, stageFilter]);

// //   const totalLikes = visible.reduce((s, p) => s + p.likes, 0);
// //   const totalDislikes = visible.reduce((s, p) => s + p.dislikes, 0);

// //   const existingFeedbacks = selectedPrompt ? getFeedbacks(selectedPrompt.id) : [];

// //   return (
// //     <div className="max-w-6xl mx-auto">
// //       <header className="bg-gradient-header text-white rounded-2xl p-6 text-center mb-6 shadow-card">
// //         <h1 className="text-2xl font-bold mb-1">
// //           {currentCategory.icon} {currentCategory.name} Prompts
// //         </h1>
// //         <p className="text-sm opacity-90">
// //           {visible.length} approved prompts • {currentCategory.description}
// //         </p>
// //       </header>

// //       <section className="bg-card rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row gap-3">
// //         <Input
// //           type="search"
// //           placeholder="Search prompts..."
// //           value={search}
// //           onChange={(e) => setSearch(e.target.value)}
// //           className="flex-1"
// //         />
// //         <Select value={stageFilter} onValueChange={setStageFilter}>
// //           <SelectTrigger className="sm:w-[240px]">
// //             <SelectValue placeholder="All Stages" />
// //           </SelectTrigger>
// //           <SelectContent>
// //             <SelectItem value={ALL_STAGES}>All Stages</SelectItem>
// //             {stages.map((s) => (
// //               <SelectItem key={s} value={s}>{s}</SelectItem>
// //             ))}
// //           </SelectContent>
// //         </Select>
// //       </section>

// //       {filtered.length === 0 ? (
// //         <div className="bg-card rounded-xl p-8 text-center text-muted-foreground shadow-card">
// //           No prompts match your search.
// //         </div>
// //       ) : (
// //         <>
// //           {/* Desktop table view */}
// //           <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
// //             <Table>
// //               <TableHeader>
// //                 <TableRow className="bg-muted/40 hover:bg-muted/40">
// //                   <TableHead className="w-[150px]">Stage</TableHead>
// //                   <TableHead className="w-[140px]">Steps</TableHead>
// //                   <TableHead className="w-[220px]">Question addressed</TableHead>
// //                   <TableHead>Prompt</TableHead>
// //                   <TableHead className="w-[130px]">Created by</TableHead>
// //                   <TableHead className="w-[150px] text-right">Actions</TableHead>
// //                 </TableRow>
// //               </TableHeader>
// //               <TableBody>
// //                 {filtered.map((p) => {
// //                   const liked = userReactions[p.id] === "like";
// //                   const disliked = userReactions[p.id] === "dislike";
// //                   return (
// //                     <TableRow 
// //                       key={p.id} 
// //                       className="align-top cursor-pointer hover:bg-muted/50 transition-colors"
// //                       onClick={() => handlePromptClick(p)}
// //                     >
// //                       <TableCell>
// //                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
// //                           {p.stage}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell>
// //                         <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
// //                           {p.steps}
// //                         </span>
// //                       </TableCell>
// //                       <TableCell className="text-sm italic text-muted-foreground">
// //                         📌 {p.question.length > 80 ? p.question.substring(0, 80) + "..." : p.question}
// //                       </TableCell>
// //                       <TableCell className="text-sm text-foreground leading-relaxed">
// //                         {p.promptText.length > 100 ? `${p.promptText.substring(0, 100)}...` : p.promptText}
// //                       </TableCell>
// //                       <TableCell className="text-sm font-medium">{p.createdBy}</TableCell>
// //                       <TableCell onClick={(e) => e.stopPropagation()}>
// //                         <div className="flex justify-end gap-2">
// //                           <button
// //                             onClick={() => handleLike(p.id)}
// //                             aria-pressed={liked}
// //                             aria-label="Like prompt"
// //                             className={cn(
// //                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
// //                               liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
// //                             )}
// //                           >
// //                             <ThumbsUp className="w-3.5 h-3.5" />
// //                             <span>{p.likes}</span>
// //                           </button>
// //                           <button
// //                             onClick={() => handleDislike(p.id)}
// //                             aria-pressed={disliked}
// //                             aria-label="Dislike prompt"
// //                             className={cn(
// //                               "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
// //                               disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
// //                             )}
// //                           >
// //                             <ThumbsDown className="w-3.5 h-3.5" />
// //                             <span>{p.dislikes}</span>
// //                           </button>
// //                         </div>
// //                       </TableCell>
// //                     </TableRow>
// //                   );
// //                 })}
// //               </TableBody>
// //             </Table>
// //           </div>

// //           {/* Mobile cards view */}
// //           <div className="md:hidden space-y-3">
// //             {filtered.map((p) => {
// //               const liked = userReactions[p.id] === "like";
// //               const disliked = userReactions[p.id] === "dislike";
// //               return (
// //                 <article 
// //                   key={p.id} 
// //                   className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-lg transition-all"
// //                   onClick={() => handlePromptClick(p)}
// //                 >
// //                   <div className="flex flex-wrap gap-2 mb-3">
// //                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(p.stage))}>
// //                       {p.stage}
// //                     </span>
// //                     <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(p.stage))}>
// //                       {p.steps}
// //                     </span>
// //                   </div>
// //                   <p className="italic text-muted-foreground mb-3 text-sm">📌 {p.question}</p>
// //                   <div className="bg-prompt-box border border-border rounded-lg p-3 mb-3 text-sm leading-relaxed">
// //                     {p.promptText.length > 150 ? `${p.promptText.substring(0, 150)}...` : p.promptText}
// //                   </div>
// //                   <div className="flex items-center justify-between">
// //                     <p className="text-xs text-muted-foreground">
// //                       Created by <span className="font-medium text-foreground">{p.createdBy}</span>
// //                     </p>
// //                     <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
// //                       <button
// //                         onClick={() => handleLike(p.id)}
// //                         className={cn(
// //                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
// //                           liked ? "bg-like text-like-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
// //                         )}
// //                       >
// //                         <ThumbsUp className="w-3.5 h-3.5" />
// //                         <span>{p.likes}</span>
// //                       </button>
// //                       <button
// //                         onClick={() => handleDislike(p.id)}
// //                         className={cn(
// //                           "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border-0 cursor-pointer",
// //                           disliked ? "bg-dislike text-dislike-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
// //                         )}
// //                       >
// //                         <ThumbsDown className="w-3.5 h-3.5" />
// //                         <span>{p.dislikes}</span>
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </article>
// //               );
// //             })}
// //           </div>
// //         </>
// //       )}

// //       <footer className="bg-card rounded-xl p-5 mt-6 shadow-card flex items-center justify-around text-center">
// //         <div>
// //           <div className="text-2xl font-bold text-like">👍 {totalLikes}</div>
// //           <div className="text-xs text-muted-foreground mt-1">Total likes</div>
// //         </div>
// //         <div className="w-px h-10 bg-border" />
// //         <div>
// //           <div className="text-2xl font-bold text-dislike">👎 {totalDislikes}</div>
// //           <div className="text-xs text-muted-foreground mt-1">Total dislikes</div>
// //         </div>
// //       </footer>

// //       <PromptDetailDialog
// //         prompt={selectedPrompt}
// //         isOpen={isDialogOpen}
// //         onClose={() => setIsDialogOpen(false)}
// //         onSaveFeedback={handleSaveFeedback}
// //         existingFeedbacks={existingFeedbacks.map(f => ({
// //           id: f.id,
// //           userName: f.userName,
// //           feedback: f.feedback,
// //           createdAt: f.createdAt
// //         }))}
// //         userRole={user?.role}
// //         userName={user?.name}
// //       />
// //     </div>
// //   );
// // };

// // export default Browse;