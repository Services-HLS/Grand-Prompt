// // import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// // import { initialPrompts, type Prompt } from "@/data/prompts";

// // const STORAGE_KEY = "grant-prompts-data";

// // type NewPromptInput = {
// //   stage: string;
// //   steps: string;
// //   question: string;
// //   promptText: string;
// //   createdBy: string;
// //   employeeId: string;
// // };

// // type PromptsContextValue = {
// //   prompts: Prompt[];
// //   addPrompt: (input: NewPromptInput) => void;
// //   approvePrompt: (id: number, moderatorEmail: string) => void;
// //   rejectPrompt: (id: number, reason: string, moderatorEmail: string) => void;
// //   updateLikes: (id: number, delta: number) => void;
// //   updateDislikes: (id: number, delta: number) => void;
// // };

// // const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

// // export const PromptsProvider = ({ children }: { children: ReactNode }) => {
// //   const [prompts, setPrompts] = useState<Prompt[]>(() => {
// //     try {
// //       const raw = localStorage.getItem(STORAGE_KEY);
// //       if (raw) return JSON.parse(raw);
// //     } catch {
// //       /* ignore */
// //     }
// //     return initialPrompts;
// //   });

// //   useEffect(() => {
// //     try {
// //       localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
// //     } catch {
// //       /* ignore */
// //     }
// //   }, [prompts]);

// //   const addPrompt = (input: NewPromptInput) => {
// //     setPrompts((prev) => [
// //       ...prev,
// //       {
// //         id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
// //         ...input,
// //         status: "pending",
// //         submittedAt: new Date().toISOString(),
// //         likes: 0,
// //         dislikes: 0,
// //       },
// //     ]);
// //   };

// //   const approvePrompt = (id: number, moderatorEmail: string) => {
// //     setPrompts((prev) =>
// //       prev.map((p) =>
// //         p.id === id
// //           ? { ...p, status: "approved", approvedAt: new Date().toISOString(), approvedBy: moderatorEmail, rejectionReason: undefined }
// //           : p,
// //       ),
// //     );
// //   };

// //   const rejectPrompt = (id: number, reason: string, moderatorEmail: string) => {
// //     setPrompts((prev) =>
// //       prev.map((p) =>
// //         p.id === id
// //           ? { ...p, status: "rejected", rejectionReason: reason, approvedBy: moderatorEmail, approvedAt: new Date().toISOString() }
// //           : p,
// //       ),
// //     );
// //   };

// //   const updateLikes = (id: number, delta: number) =>
// //     setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + delta } : p)));
// //   const updateDislikes = (id: number, delta: number) =>
// //     setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, dislikes: p.dislikes + delta } : p)));

// //   return (
// //     <PromptsContext.Provider value={{ prompts, addPrompt, approvePrompt, rejectPrompt, updateLikes, updateDislikes }}>
// //       {children}
// //     </PromptsContext.Provider>
// //   );
// // };

// // export const usePrompts = () => {
// //   const ctx = useContext(PromptsContext);
// //   if (!ctx) throw new Error("usePrompts must be used inside PromptsProvider");
// //   return ctx;
// // };

// import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import { initialPrompts, type Prompt } from "@/data/prompts";

// const STORAGE_KEY = "grant-prompts-data";
// const FEEDBACKS_KEY = "grant-prompts-feedbacks";

// export type PromptFeedback = {
//   id: number;
//   promptId: number;
//   userId: string;
//   userName: string;
//   feedback: string;
//   createdAt: string;
// };

// type NewPromptInput = {
//   stage: string;
//   steps: string;
//   question: string;
//   promptText: string;
//   createdBy: string;
//   employeeId: string;
//   category?: string; // Make optional with default
// };

// type PromptsContextValue = {
//   prompts: Prompt[];
//   addPrompt: (input: NewPromptInput) => void;
//   approvePrompt: (id: number, moderatorEmail: string) => void;
//   rejectPrompt: (id: number, reason: string, moderatorEmail: string) => void;
//   updateLikes: (id: number, delta: number) => void;
//   updateDislikes: (id: number, delta: number) => void;
//   addFeedback: (promptId: number, feedback: string, userId: string, userName: string) => void;
//   getFeedbacks: (promptId: number) => PromptFeedback[];
// };

// const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

// export const PromptsProvider = ({ children }: { children: ReactNode }) => {
//   const [prompts, setPrompts] = useState<Prompt[]>(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) return JSON.parse(raw);
//     } catch {
//       /* ignore */
//     }
//     return initialPrompts;
//   });

//   const [feedbacks, setFeedbacks] = useState<PromptFeedback[]>(() => {
//     try {
//       const raw = localStorage.getItem(FEEDBACKS_KEY);
//       if (raw) return JSON.parse(raw);
//     } catch {
//       /* ignore */
//     }
//     return [];
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
//     } catch {
//       /* ignore */
//     }
//   }, [prompts]);

//   useEffect(() => {
//     try {
//       localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
//     } catch {
//       /* ignore */
//     }
//   }, [feedbacks]);

//   const addPrompt = (input: NewPromptInput) => {
//     const newPrompt: Prompt = {
//       id: prompts.length ? Math.max(...prompts.map((p) => p.id)) + 1 : 1,
//       stage: input.stage,
//       steps: input.steps,
//       question: input.question,
//       promptText: input.promptText,
//       createdBy: input.createdBy,
//       employeeId: input.employeeId,
//       status: "pending",
//       submittedAt: new Date().toISOString(),
//       likes: 0,
//       dislikes: 0,
//       category: input.category || "grant", // Add default category
//     };
    
//     setPrompts((prev) => [...prev, newPrompt]);
//   };

//   const approvePrompt = (id: number, moderatorEmail: string) => {
//     setPrompts((prev) =>
//       prev.map((p) =>
//         p.id === id
//           ? { 
//               ...p, 
//               status: "approved", 
//               approvedAt: new Date().toISOString(), 
//               approvedBy: moderatorEmail, 
//               rejectionReason: undefined 
//             }
//           : p,
//       ),
//     );
//   };

//   const rejectPrompt = (id: number, reason: string, moderatorEmail: string) => {
//     setPrompts((prev) =>
//       prev.map((p) =>
//         p.id === id
//           ? { 
//               ...p, 
//               status: "rejected", 
//               rejectionReason: reason, 
//               approvedBy: moderatorEmail, 
//               approvedAt: new Date().toISOString() 
//             }
//           : p,
//       ),
//     );
//   };

//   const updateLikes = (id: number, delta: number) =>
//     setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + delta } : p)));
  
//   const updateDislikes = (id: number, delta: number) =>
//     setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, dislikes: p.dislikes + delta } : p)));

//   const addFeedback = (promptId: number, feedback: string, userId: string, userName: string) => {
//     const newFeedback: PromptFeedback = {
//       id: Date.now(),
//       promptId,
//       userId,
//       userName,
//       feedback,
//       createdAt: new Date().toISOString(),
//     };
//     setFeedbacks((prev) => [...prev, newFeedback]);
//   };

//   const getFeedbacks = (promptId: number) => {
//     return feedbacks.filter((f) => f.promptId === promptId);
//   };

//   return (
//     <PromptsContext.Provider value={{ 
//       prompts, 
//       addPrompt, 
//       approvePrompt, 
//       rejectPrompt, 
//       updateLikes, 
//       updateDislikes,
//       addFeedback,
//       getFeedbacks
//     }}>
//       {children}
//     </PromptsContext.Provider>
//   );
// };

// export const usePrompts = () => {
//   const ctx = useContext(PromptsContext);
//   if (!ctx) throw new Error("usePrompts must be used inside PromptsProvider");
//   return ctx;
// };

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { type Prompt } from "@/data/prompts";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export type PromptFeedback = {
  id: number;
  promptId: number;
  userId: string;
  userName: string;
  feedback: string;
  createdAt: string;
};

type NewPromptInput = {
  stage: string;
  steps: string;
  question: string;
  promptText: string;
  createdBy: string;
  employeeId: string;
  category?: string;
};

type PromptsContextValue = {
  prompts: Prompt[];
  addPrompt: (input: NewPromptInput) => Promise<void>;
  approvePrompt: (id: number, moderatorEmail: string) => Promise<void>;
  rejectPrompt: (id: number, reason: string, moderatorEmail: string) => Promise<void>;
  updateLikes: (id: number, delta: number) => Promise<void>;
  updateDislikes: (id: number, delta: number) => Promise<void>;
  addFeedback: (promptId: number, feedback: string, userId: string, userName: string) => Promise<void>;
  getFeedbacks: (promptId: number) => PromptFeedback[];
  updatePrompt: (id: number, updates: Partial<Prompt>) => Promise<void>;
};

const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

export const PromptsProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [feedbacks, setFeedbacks] = useState<PromptFeedback[]>([]);

  const mapPrompt = (row: any): Prompt => ({
    id: row.id,
    stage: row.stage,
    steps: row.steps,
    question: row.question,
    promptText: row.promptText,
    createdBy: row.createdBy?.name ?? "Unknown",
    employeeId: row.createdBy?.email ?? "",
    status: String(row.status || "PENDING").toLowerCase() as Prompt["status"],
    rejectionReason: row.rejectionReason ?? undefined,
    submittedAt: row.submittedAt ?? new Date().toISOString(),
    approvedAt: row.approvedAt ?? undefined,
    approvedBy: row.approvedBy ? String(row.approvedBy) : undefined,
    likes: row.likes ?? 0,
    dislikes: row.dislikes ?? 0,
    category: row.category ?? "grant",
  });

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const fetchPrompts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompts`);
      if (!response.ok) return;
      const rows = await response.json();
      const mappedPrompts = rows.map(mapPrompt);
      setPrompts(mappedPrompts);

      const feedbackRows = await Promise.all(
        mappedPrompts.map(async (prompt) => {
          const feedbackResponse = await fetch(`${API_BASE_URL}/prompts/${prompt.id}/feedback`);
          if (!feedbackResponse.ok) return [];
          const data = await feedbackResponse.json();
          return data.map(
            (row: any): PromptFeedback => ({
              id: row.id,
              promptId: row.promptId,
              userId: String(row.user?.id ?? ""),
              userName: row.user?.name ?? "Unknown",
              feedback: row.feedback,
              createdAt: row.createdAt,
            }),
          );
        }),
      );
      setFeedbacks(feedbackRows.flat());
    } catch {
      // Keep existing data when backend is unavailable.
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const addPrompt = async (input: NewPromptInput) => {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        stage: input.stage,
        steps: input.steps,
        question: input.question,
        promptText: input.promptText,
        category: input.category ?? "grant",
      }),
    });
    if (!response.ok) throw new Error("Failed to add prompt");
    await fetchPrompts();
  };

  const approvePrompt = async (id: number, _moderatorEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}/approve`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to approve prompt");
    await fetchPrompts();
  };

  const rejectPrompt = async (id: number, reason: string, _moderatorEmail: string) => {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}/reject`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error("Failed to reject prompt");
    await fetchPrompts();
  };

  const react = async (id: number, value: "LIKE" | "DISLIKE") => {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}/reaction`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error("Failed to react");
    const result = await response.json();
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: result.likes ?? p.likes, dislikes: result.dislikes ?? p.dislikes } : p,
      ),
    );
  };

  const updateLikes = async (id: number, delta: number) => {
    if (delta !== 0) await react(id, "LIKE");
  };

  const updateDislikes = async (id: number, delta: number) => {
    if (delta !== 0) await react(id, "DISLIKE");
  };

  const addFeedback = async (promptId: number, feedback: string, _userId: string, _userName: string) => {
    const response = await fetch(`${API_BASE_URL}/prompts/${promptId}/feedback`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    });
    if (!response.ok) throw new Error("Failed to add feedback");
    const row = await response.json();
    const mapped: PromptFeedback = {
      id: row.id,
      promptId: row.promptId,
      userId: String(row.user?.id ?? ""),
      userName: row.user?.name ?? "Unknown",
      feedback: row.feedback,
      createdAt: row.createdAt,
    };
    setFeedbacks((prev) => [mapped, ...prev]);
  };

  const getFeedbacks = (promptId: number) => feedbacks.filter((f) => f.promptId === promptId);

  const updatePrompt = async (id: number, updates: Partial<Prompt>) => {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        stage: updates.stage,
        steps: updates.steps,
        question: updates.question,
        promptText: updates.promptText,
        category: updates.category,
      }),
    });
    if (!response.ok) throw new Error("Failed to update prompt");
    await fetchPrompts();
  };

  return (
    <PromptsContext.Provider value={{ 
      prompts, 
      addPrompt, 
      approvePrompt, 
      rejectPrompt, 
      updateLikes, 
      updateDislikes,
      addFeedback,
      getFeedbacks,
      updatePrompt
    }}>
      {children}
    </PromptsContext.Provider>
  );
};

export const usePrompts = () => {
  const ctx = useContext(PromptsContext);
  if (!ctx) throw new Error("usePrompts must be used inside PromptsProvider");
  return ctx;
};