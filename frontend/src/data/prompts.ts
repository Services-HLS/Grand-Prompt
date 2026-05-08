// // export type Prompt = {
// //   id: number;
// //   stage: string;
// //   steps: string;
// //   question: string;
// //   promptText: string;
// //   createdBy: string;
// //   employeeId: string;
// //   status: "pending" | "approved" | "rejected";
// //   rejectionReason?: string;
// //   submittedAt: string;
// //   approvedAt?: string;
// //   approvedBy?: string;
// //   likes: number;
// //   dislikes: number;
// // };

// // export const STAGES = [
// //   "1. Idea development",
// //   "2. Proposal development",
// //   "3. Submission and response",
// // ] as const;

// // export const initialPrompts: Prompt[] = [
// //   { id: 1, stage: "1. Idea development", steps: "Opportunity identification", question: "Is there an opportunity worth pursuing?", promptText: "Act as a candid, strategic, and supportive senior grant mentor. Help me identify if this opportunity is worth pursuing based on my current capacity and goals.", createdBy: "Jonny Lo", employeeId: "employee@example.com", status: "approved", submittedAt: "2025-01-10T09:00:00Z", approvedAt: "2025-01-11T10:00:00Z", approvedBy: "moderator@example.com", likes: 5, dislikes: 1 },
// //   { id: 2, stage: "1. Idea development", steps: "Idea formulation", question: "Do I have the beginning of a fundable idea?", promptText: "Act as a senior grant mentor helping me determine if my rough idea has fundable potential. Ask me 5 clarifying questions.", createdBy: "Jonny Lo", employeeId: "employee@example.com", status: "approved", submittedAt: "2025-01-12T09:00:00Z", approvedAt: "2025-01-13T10:00:00Z", approvedBy: "moderator@example.com", likes: 8, dislikes: 0 },
// //   { id: 3, stage: "1. Idea development", steps: "Winability check", question: "Is this realistically competitive for this scheme?", promptText: "Act as a candidate senior reviewer doing a winability check. Rate my idea from 1-10 and explain the rating.", createdBy: "Jonny Lo", employeeId: "employee@example.com", status: "approved", submittedAt: "2025-01-14T09:00:00Z", approvedAt: "2025-01-15T10:00:00Z", approvedBy: "moderator@example.com", likes: 12, dislikes: 2 },
// //   { id: 4, stage: "2. Proposal development", steps: "Narrative framing", question: "What is the fundable story?", promptText: "Act as a senior grant mentor helping me turn my rough notes into a crisp, fundable narrative structure.", createdBy: "Karthika Kumar", employeeId: "employee@example.com", status: "approved", submittedAt: "2025-01-16T09:00:00Z", approvedAt: "2025-01-17T10:00:00Z", approvedBy: "moderator@example.com", likes: 7, dislikes: 1 },
// //   { id: 5, stage: "2. Proposal development", steps: "Humaniser", question: "Can we humanise the text?", promptText: "Act as a senior grant mentor delivering readable, humanised grant language. Rewrite this to be compelling but not jargon-heavy.", createdBy: "Karthika", employeeId: "employee@example.com", status: "approved", submittedAt: "2025-01-18T09:00:00Z", approvedAt: "2025-01-19T10:00:00Z", approvedBy: "moderator@example.com", likes: 9, dislikes: 0 },
// // ];

// export type Prompt = {
//   id: number;
//   stage: string;
//   steps: string;
//   question: string;
//   promptText: string;
//   createdBy: string;
//   employeeId: string;
//   status: "pending" | "approved" | "rejected";
//   rejectionReason?: string;
//   submittedAt: string;
//   approvedAt?: string;
//   approvedBy?: string;
//   likes: number;
//   dislikes: number;
//   category: string;  // ✅ ADDED
// };

// export const STAGES = [
//   "1. Idea development",
//   "2. Proposal development",
//   "3. Submission and response",
// ] as const;

// export const initialPrompts: Prompt[] = [
//   { 
//     id: 1, 
//     stage: "1. Idea development", 
//     steps: "Opportunity identification", 
//     question: "Is there an opportunity worth pursuing?", 
//     promptText: "Act as a candid, strategic, and supportive senior grant mentor. Help me identify if this opportunity is worth pursuing based on my current capacity and goals.", 
//     createdBy: "Jonny Lo", 
//     employeeId: "employee@example.com", 
//     status: "approved", 
//     submittedAt: "2025-01-10T09:00:00Z", 
//     approvedAt: "2025-01-11T10:00:00Z", 
//     approvedBy: "moderator@example.com", 
//     likes: 5, 
//     dislikes: 1,
//     category: "grant"
//   },
//   { 
//     id: 2, 
//     stage: "1. Idea development", 
//     steps: "Idea formulation", 
//     question: "Do I have the beginning of a fundable idea?", 
//     promptText: "Act as a senior grant mentor helping me determine if my rough idea has fundable potential. Ask me 5 clarifying questions.", 
//     createdBy: "Jonny Lo", 
//     employeeId: "employee@example.com", 
//     status: "approved", 
//     submittedAt: "2025-01-12T09:00:00Z", 
//     approvedAt: "2025-01-13T10:00:00Z", 
//     approvedBy: "moderator@example.com", 
//     likes: 8, 
//     dislikes: 0,
//     category: "grant"
//   },
//   { 
//     id: 3, 
//     stage: "1. Idea development", 
//     steps: "Winability check", 
//     question: "Is this realistically competitive for this scheme?", 
//     promptText: "Act as a candidate senior reviewer doing a winability check. Rate my idea from 1-10 and explain the rating.", 
//     createdBy: "Jonny Lo", 
//     employeeId: "employee@example.com", 
//     status: "approved", 
//     submittedAt: "2025-01-14T09:00:00Z", 
//     approvedAt: "2025-01-15T10:00:00Z", 
//     approvedBy: "moderator@example.com", 
//     likes: 12, 
//     dislikes: 2,
//     category: "grant"
//   },
//   { 
//     id: 4, 
//     stage: "2. Proposal development", 
//     steps: "Narrative framing", 
//     question: "What is the fundable story?", 
//     promptText: "Act as a senior grant mentor helping me turn my rough notes into a crisp, fundable narrative structure.", 
//     createdBy: "Karthika Kumar", 
//     employeeId: "employee@example.com", 
//     status: "approved", 
//     submittedAt: "2025-01-16T09:00:00Z", 
//     approvedAt: "2025-01-17T10:00:00Z", 
//     approvedBy: "moderator@example.com", 
//     likes: 7, 
//     dislikes: 1,
//     category: "grant"
//   },
//   { 
//     id: 5, 
//     stage: "2. Proposal development", 
//     steps: "Humaniser", 
//     question: "Can we humanise the text?", 
//     promptText: "Act as a senior grant mentor delivering readable, humanised grant language. Rewrite this to be compelling but not jargon-heavy.", 
//     createdBy: "Karthika", 
//     employeeId: "employee@example.com", 
//     status: "approved", 
//     submittedAt: "2025-01-18T09:00:00Z", 
//     approvedAt: "2025-01-19T10:00:00Z", 
//     approvedBy: "moderator@example.com", 
//     likes: 9, 
//     dislikes: 0,
//     category: "grant"
//   },
// ];

export type Prompt = {
  id: number;
  stage: string;
  steps: string;
  question: string;
  promptText: string;
  createdBy: string;
  employeeId: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  likes: number;
  dislikes: number;
  category: string;
};

export const STAGES = [
  "1. Idea development",
  "2. Proposal development",
  "3. Submission and response",
] as const;

export const initialPrompts: Prompt[] = [
  // ========== APPROVED PROMPTS (Existing ones) ==========
  { 
    id: 1, 
    stage: "1. Idea development", 
    steps: "Opportunity identification", 
    question: "Is there an opportunity worth pursuing?", 
    promptText: "Act as a candid, strategic, and supportive senior grant mentor. Help me identify if this opportunity is worth pursuing based on my current capacity and goals.", 
    createdBy: "Jonny Lo", 
    employeeId: "employee@example.com", 
    status: "approved", 
    submittedAt: "2025-01-10T09:00:00Z", 
    approvedAt: "2025-01-11T10:00:00Z", 
    approvedBy: "moderator@example.com", 
    likes: 5, 
    dislikes: 1,
    category: "grant"
  },
  { 
    id: 2, 
    stage: "1. Idea development", 
    steps: "Idea formulation", 
    question: "Do I have the beginning of a fundable idea?", 
    promptText: "Act as a senior grant mentor helping me determine if my rough idea has fundable potential. Ask me 5 clarifying questions.", 
    createdBy: "Jonny Lo", 
    employeeId: "employee@example.com", 
    status: "approved", 
    submittedAt: "2025-01-12T09:00:00Z", 
    approvedAt: "2025-01-13T10:00:00Z", 
    approvedBy: "moderator@example.com", 
    likes: 8, 
    dislikes: 0,
    category: "grant"
  },
  { 
    id: 3, 
    stage: "1. Idea development", 
    steps: "Winability check", 
    question: "Is this realistically competitive for this scheme?", 
    promptText: "Act as a candidate senior reviewer doing a winability check. Rate my idea from 1-10 and explain the rating.", 
    createdBy: "Jonny Lo", 
    employeeId: "employee@example.com", 
    status: "approved", 
    submittedAt: "2025-01-14T09:00:00Z", 
    approvedAt: "2025-01-15T10:00:00Z", 
    approvedBy: "moderator@example.com", 
    likes: 12, 
    dislikes: 2,
    category: "grant"
  },
  { 
    id: 4, 
    stage: "2. Proposal development", 
    steps: "Narrative framing", 
    question: "What is the fundable story?", 
    promptText: "Act as a senior grant mentor helping me turn my rough notes into a crisp, fundable narrative structure.", 
    createdBy: "Karthika Kumar", 
    employeeId: "employee@example.com", 
    status: "approved", 
    submittedAt: "2025-01-16T09:00:00Z", 
    approvedAt: "2025-01-17T10:00:00Z", 
    approvedBy: "moderator@example.com", 
    likes: 7, 
    dislikes: 1,
    category: "grant"
  },
  { 
    id: 5, 
    stage: "2. Proposal development", 
    steps: "Humaniser", 
    question: "Can we humanise the text?", 
    promptText: "Act as a senior grant mentor delivering readable, humanised grant language. Rewrite this to be compelling but not jargon-heavy.", 
    createdBy: "Karthika", 
    employeeId: "employee@example.com", 
    status: "approved", 
    submittedAt: "2025-01-18T09:00:00Z", 
    approvedAt: "2025-01-19T10:00:00Z", 
    approvedBy: "moderator@example.com", 
    likes: 9, 
    dislikes: 0,
    category: "grant"
  },

  // ========== PENDING PROMPTS (Waiting for approval) ==========
  { 
    id: 6, 
    stage: "1. Idea development", 
    steps: "Stakeholder analysis", 
    question: "Who are the key stakeholders and what do they care about?", 
    promptText: "Act as a stakeholder engagement expert. Help me identify all relevant stakeholders for my grant project and analyze their interests, influence, and expectations.", 
    createdBy: "Emily Chen", 
    employeeId: "emily@example.com", 
    status: "pending", 
    submittedAt: "2025-04-25T11:30:00Z", 
    likes: 0, 
    dislikes: 0,
    category: "grant"
  },
  { 
    id: 7, 
    stage: "2. Proposal development", 
    steps: "Budget justification", 
    question: "How do I write a compelling budget narrative?", 
    promptText: "Act as a grants finance officer. Review my budget numbers and help me write a clear, persuasive budget justification that aligns with my project narrative.", 
    createdBy: "Michael Rodriguez", 
    employeeId: "michael@example.com", 
    status: "pending", 
    submittedAt: "2025-04-26T14:15:00Z", 
    likes: 0, 
    dislikes: 0,
    category: "grant"
  },
  { 
    id: 8, 
    stage: "3. Submission and response", 
    steps: "Cover letter", 
    question: "What should my grant cover letter include?", 
    promptText: "Act as a grant writing expert. Draft a professional cover letter template for my grant submission that highlights our organization's strengths.", 
    createdBy: "Sarah Johnson", 
    employeeId: "sarah@example.com", 
    status: "pending", 
    submittedAt: "2025-04-27T09:45:00Z", 
    likes: 0, 
    dislikes: 0,
    category: "grant"
  },

  // ========== REJECTED PROMPTS (With rejection reasons) ==========
  { 
    id: 9, 
    stage: "1. Idea development", 
    steps: "Literature review", 
    question: "What are the key papers in this field?", 
    promptText: "Act as a research librarian. Find and summarize 10 key academic papers on community health interventions in low-resource settings.", 
    createdBy: "David Kim", 
    employeeId: "david@example.com", 
    status: "rejected", 
    rejectionReason: "This prompt is too broad and requests specific external research. Keep prompts focused on strategic thinking and writing guidance, not information retrieval.",
    submittedAt: "2025-04-20T10:00:00Z", 
    approvedAt: "2025-04-22T15:30:00Z",
    approvedBy: "moderator@example.com",
    likes: 2, 
    dislikes: 3,
    category: "grant"
  },
  { 
    id: 10, 
    stage: "2. Proposal development", 
    steps: "Partner identification", 
    question: "How to find collaboration partners?", 
    promptText: "Search online databases and find potential research partners for my climate change project in Southeast Asia.", 
    createdBy: "Lisa Wong", 
    employeeId: "lisa@example.com", 
    status: "rejected", 
    rejectionReason: "Cannot include requests for external data search. Rephrase as: 'Act as a partnership strategist. What criteria should I use to evaluate potential research partners?'",
    submittedAt: "2025-04-18T13:20:00Z", 
    approvedAt: "2025-04-19T11:45:00Z",
    approvedBy: "moderator@example.com",
    likes: 1, 
    dislikes: 4,
    category: "grant"
  },
  { 
    id: 11, 
    stage: "3. Submission and response", 
    steps: "Rebuttal letter", 
    question: "How to respond to reviewer feedback?", 
    promptText: "Write a rebuttal letter template for me based on these reviewer comments [COPY PASTE COMMENTS HERE] and make it sound really defensive.", 
    createdBy: "James Taylor", 
    employeeId: "james@example.com", 
    status: "rejected", 
    rejectionReason: "Professional tone required. Avoid defensive language. Ask for strategic approaches instead: 'Act as a senior grant mentor. Help me constructively address reviewer feedback and strengthen my resubmission.'",
    submittedAt: "2025-04-15T16:00:00Z", 
    approvedAt: "2025-04-17T09:30:00Z",
    approvedBy: "moderator@example.com",
    likes: 0, 
    dislikes: 2,
    category: "grant"
  },

  // ========== Research Category - Pending ==========
  { 
    id: 102, 
    stage: "Research Question", 
    steps: "Hypothesis development", 
    question: "How to formulate a testable hypothesis?", 
    promptText: "Act as a research methodology expert. Help me convert my research question into clear, testable hypotheses with measurable variables.", 
    createdBy: "Dr. Smith", 
    employeeId: "smith@example.com", 
    status: "pending", 
    submittedAt: "2025-04-26T08:00:00Z", 
    likes: 0, 
    dislikes: 0,
    category: "research"
  },

  // ========== Teaching Category - Rejected ==========
  { 
    id: 202, 
    stage: "Assessment", 
    steps: "Grading rubric", 
    question: "How to create fair grading criteria?", 
    promptText: "Give me a 100-point grading rubric for my final exam that makes sure most students pass.", 
    createdBy: "Prof. Williams", 
    employeeId: "williams@example.com", 
    status: "rejected", 
    rejectionReason: "Focus on learning outcomes, not grade inflation. Phrase as: 'Act as an assessment specialist. Design a criterion-referenced rubric aligned with learning objectives.'",
    submittedAt: "2025-04-19T14:00:00Z", 
    approvedAt: "2025-04-21T10:00:00Z",
    approvedBy: "moderator@example.com",
    likes: 1, 
    dislikes: 3,
    category: "teaching"
  },

  // ========== Business Category - Pending ==========
  { 
    id: 303, 
    stage: "Pitch", 
    steps: "Investor deck", 
    question: "What slides should my pitch deck include?", 
    promptText: "Act as a venture capital advisor. Outline the 10 essential slides for my startup pitch deck and what each slide should communicate.", 
    createdBy: "Alex Wong", 
    employeeId: "alex@example.com", 
    status: "pending", 
    submittedAt: "2025-04-27T11:00:00Z", 
    likes: 0, 
    dislikes: 0,
    category: "business"
  },
];