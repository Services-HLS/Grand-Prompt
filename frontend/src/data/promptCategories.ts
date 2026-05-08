import { Prompt } from "./prompts";

export type PromptCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompts: Prompt[];
};

// Grant Writing Prompts (your existing ones)
const grantPrompts: Prompt[] = [
  { 
    id: 1, 
    stage: "1. Idea development", 
    steps: "Opportunity identification", 
    question: "Is there an opportunity worth pursuing?", 
    promptText: "Act as a candid, strategic, and supportive senior grant mentor. Help me identify if this opportunity is worth pursuing based on my current capacity and goals.", 
    createdBy: "Jonny Lo", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
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
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
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
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
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
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
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
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 9, 
    dislikes: 0,
    category: "grant"
  },
];

// Research Prompts
const researchPrompts: Prompt[] = [
  { 
    id: 101, 
    stage: "Research Question", 
    steps: "Problem identification", 
    question: "What problem are you solving?", 
    promptText: "Act as a research methodology expert. Help me formulate a clear, impactful research question that addresses a genuine gap in the literature.", 
    createdBy: "Dr. Smith", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 15, 
    dislikes: 2,
    category: "research"
  },
  { 
    id: 102, 
    stage: "Literature Review", 
    steps: "Gap analysis", 
    question: "What's missing in current research?", 
    promptText: "Act as a senior academic reviewer. Analyze my literature review and identify 3-5 key gaps that my research could address.", 
    createdBy: "Dr. Smith", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 10, 
    dislikes: 1,
    category: "research"
  },
  { 
    id: 103, 
    stage: "Methodology", 
    steps: "Research design", 
    question: "Is my methodology sound?", 
    promptText: "Act as a research methods consultant. Critique my research methodology and suggest improvements for validity and reliability.", 
    createdBy: "Prof. Johnson", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 18, 
    dislikes: 3,
    category: "research"
  },
];

// Teaching Prompts
const teachingPrompts: Prompt[] = [
  { 
    id: 201, 
    stage: "Lesson Planning", 
    steps: "Learning objectives", 
    question: "What should students learn?", 
    promptText: "Act as an instructional designer. Help me create clear, measurable learning objectives using Bloom's taxonomy.", 
    createdBy: "Sarah Lee", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 22, 
    dislikes: 1,
    category: "teaching"
  },
  { 
    id: 202, 
    stage: "Assessment", 
    steps: "Evaluation criteria", 
    question: "How to measure student success?", 
    promptText: "Act as an assessment specialist. Design a rubric to evaluate student projects on critical thinking and creativity.", 
    createdBy: "Sarah Lee", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 14, 
    dislikes: 2,
    category: "teaching"
  },
  { 
    id: 203, 
    stage: "Engagement", 
    steps: "Activity design", 
    question: "How to make learning interactive?", 
    promptText: "Act as a creative educator. Suggest 5 engaging classroom activities that promote active learning for this topic.", 
    createdBy: "Mike Chen", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 19, 
    dislikes: 0,
    category: "teaching"
  },
];

// Business Prompts
const businessPrompts: Prompt[] = [
  { 
    id: 301, 
    stage: "Strategy", 
    steps: "Market analysis", 
    question: "Is this market opportunity viable?", 
    promptText: "Act as a business strategist. Evaluate my market entry strategy and identify 3 key risks and opportunities.", 
    createdBy: "Alex Wong", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 25, 
    dislikes: 4,
    category: "business"
  },
  { 
    id: 302, 
    stage: "Product", 
    steps: "MVP definition", 
    question: "What features should MVP have?", 
    promptText: "Act as a product manager. Help me prioritize features for my minimum viable product using the MoSCoW method.", 
    createdBy: "Alex Wong", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 17, 
    dislikes: 1,
    category: "business"
  },
  { 
    id: 303, 
    stage: "Marketing", 
    steps: "Value proposition", 
    question: "What makes us unique?", 
    promptText: "Act as a marketing expert. Craft a compelling value proposition that differentiates my product from competitors.", 
    createdBy: "Lisa Park", 
    employeeId: "admin", 
    status: "approved", 
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "moderator@example.com",
    likes: 21, 
    dislikes: 2,
    category: "business"
  },
];

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "grant",
    name: "Grant Writing",
    icon: "📝",
    description: "Prompts for grant proposals and funding",
    prompts: grantPrompts,
  },
  {
    id: "research",
    name: "Research",
    icon: "🔬",
    description: "Academic research and methodology prompts",
    prompts: researchPrompts,
  },
  {
    id: "teaching",
    name: "Teaching",
    icon: "📚",
    description: "Lesson planning and education prompts",
    prompts: teachingPrompts,
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "Strategy and product development prompts",
    prompts: businessPrompts,
  },
];