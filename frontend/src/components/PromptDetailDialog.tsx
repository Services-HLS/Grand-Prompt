import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
import { Prompt } from "@/data/prompts";
import RichTextEditor from "./RichTextEditor";
import { Pencil, Save, X } from "lucide-react";

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFeedback?: (promptId: number, feedback: string) => void;
  onEditPrompt?: (promptId: number, updates: Partial<Prompt>) => void;
  existingFeedbacks?: Array<{
    id: number;
    userName: string;
    feedback: string;
    createdAt: string;
  }>;
  userRole?: "employee" | "moderator";
  userName?: string;
}

const PromptDetailDialog = ({ 
  prompt, 
  isOpen, 
  onClose, 
  onSaveFeedback,
  onEditPrompt,
  existingFeedbacks = [],
  userRole = "employee",
  userName = ""
}: PromptDetailDialogProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPromptText, setEditPromptText] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editSteps, setEditSteps] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset edit state when prompt changes
  useEffect(() => {
    if (prompt) {
      setEditPromptText(prompt.promptText);
      setEditQuestion(prompt.question);
      setEditSteps(prompt.steps);
    }
  }, [prompt]);

  if (!prompt) return null;

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    if (onSaveFeedback) {
      await onSaveFeedback(prompt.id, feedback);
    }
    setFeedback("");
    setIsSubmitting(false);
    onClose();
  };

  const handleEditClick = () => {
    setEditPromptText(prompt.promptText);
    setEditQuestion(prompt.question);
    setEditSteps(prompt.steps);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    console.log("Saving edited prompt HTML:", editPromptText);
    setIsSaving(true);
    if (onEditPrompt) {
      await onEditPrompt(prompt.id, {
        promptText: editPromptText,  // This preserves HTML
        question: editQuestion,
        steps: editSteps,
      });
    }
    setIsEditing(false);
    setIsSaving(false);
    onClose();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPromptText(prompt.promptText);
    setEditQuestion(prompt.question);
    setEditSteps(prompt.steps);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Prompt Details</span>
              <div className="flex gap-1">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stageBadgeClass(prompt.stage))}>
                  {prompt.stage}
                </span>
                {!isEditing && (
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stepsBadgeClass(prompt.stage))}>
                    {prompt.steps}
                  </span>
                )}
              </div>
            </div>
            {userRole === "moderator" && !isEditing && (
              <Button size="sm" variant="outline" onClick={handleEditClick} className="gap-1">
                <Pencil className="w-3.5 h-3.5" />
                Edit Prompt
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Steps</Label>
                <input
                  type="text"
                  value={editSteps}
                  onChange={(e) => setEditSteps(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter steps..."
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-semibold">📌 Question Addressed</Label>
                <Textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  rows={2}
                  className="resize-none"
                  placeholder="What question does this prompt answer?"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-semibold">📝 Prompt (Rich Text)</Label>
                <RichTextEditor
                  value={editPromptText}
                  onChange={setEditPromptText}
                  placeholder="Edit your prompt with formatting (bold, italic, lists)..."
                  readOnly={false}
                />
                <p className="text-xs text-muted-foreground">
                  You can use bold, italic, bullet points, and numbered lists to format the prompt.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">📌 Question Addressed</Label>
                <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {prompt.question}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-semibold">📝 Prompt</Label>
                <div className="border border-border rounded-lg p-4 bg-card">
                  <RichTextEditor
                    value={prompt.promptText}
                    onChange={() => {}}
                    readOnly={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Created by</Label>
                  <p className="font-medium">{prompt.createdBy}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Steps</Label>
                  <p>{prompt.steps}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                    prompt.status === "approved" && "bg-green-100 text-green-700",
                    prompt.status === "pending" && "bg-yellow-100 text-yellow-700",
                    prompt.status === "rejected" && "bg-red-100 text-red-700"
                  )}>
                    {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Engagement</Label>
                  <p>👍 {prompt.likes} · 👎 {prompt.dislikes}</p>
                </div>
              </div>

              {existingFeedbacks.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <Label className="text-sm font-semibold">💬 Previous Feedback</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {existingFeedbacks.map((fb) => (
                      <div key={fb.id} className="bg-muted/20 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold">{fb.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{fb.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-3">
                <Label className="text-sm font-semibold">
                  {userRole === "moderator" ? "📋 Add Review Notes" : "💬 Your Feedback"}
                </Label>
                <Textarea
                  placeholder={
                    userRole === "moderator" 
                      ? "Add review notes, suggestions for improvement, or approval comments..."
                      : "Share your thoughts about this prompt. What works well? What could be improved?"
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={handleSaveFeedback} 
              disabled={!feedback.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : (userRole === "moderator" ? "Save Review" : "Submit Feedback")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PromptDetailDialog;



// // import { useState } from "react";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogFooter,
// // } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/button";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Label } from "@/components/ui/label";
// // import { cn } from "@/lib/utils";
// // import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
// // import { Prompt } from "@/data/prompts";
// // import RichTextEditor from "./RichTextEditor";

// // interface PromptDetailDialogProps {
// //   prompt: Prompt | null;
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSaveFeedback?: (promptId: number, feedback: string) => void;
// //   existingFeedbacks?: Array<{
// //     id: number;
// //     userName: string;
// //     feedback: string;
// //     createdAt: string;
// //   }>;
// //   userRole?: "employee" | "moderator";
// //   userName?: string;
// // }

// // const PromptDetailDialog = ({ 
// //   prompt, 
// //   isOpen, 
// //   onClose, 
// //   onSaveFeedback,
// //   existingFeedbacks = [],
// //   userRole = "employee",
// //   userName = ""
// // }: PromptDetailDialogProps) => {
// //   const [feedback, setFeedback] = useState("");
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   if (!prompt) return null;

// //   const handleSaveFeedback = async () => {
// //     if (!feedback.trim()) return;
// //     setIsSubmitting(true);
// //     if (onSaveFeedback) {
// //       await onSaveFeedback(prompt.id, feedback);
// //     }
// //     setFeedback("");
// //     setIsSubmitting(false);
// //     onClose();
// //   };

// //   return (
// //     <Dialog open={isOpen} onOpenChange={onClose}>
// //       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
// //         <DialogHeader>
// //           <DialogTitle className="flex items-center gap-2 flex-wrap">
// //             <span>Prompt Details</span>
// //             <div className="flex gap-1">
// //               <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stageBadgeClass(prompt.stage))}>
// //                 {prompt.stage}
// //               </span>
// //               <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stepsBadgeClass(prompt.stage))}>
// //                 {prompt.steps}
// //               </span>
// //             </div>
// //           </DialogTitle>
// //         </DialogHeader>

// //         <div className="space-y-4">
// //           {/* Question */}
// //           <div className="space-y-1">
// //             <Label className="text-sm font-semibold">📌 Question Addressed</Label>
// //             <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg">
// //               {prompt.question}
// //             </p>
// //           </div>

// //           {/* Prompt Text - Rich Text */}
// //           <div className="space-y-1">
// //             <Label className="text-sm font-semibold">📝 Prompt</Label>
// //             <div className="border border-border rounded-lg p-4 bg-card">
// //               <RichTextEditor
// //                 value={prompt.promptText}
// //                 onChange={() => {}}
// //                 readOnly={true}
// //               />
// //             </div>
// //           </div>

// //           {/* Metadata */}
// //           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
// //             <div className="space-y-1">
// //               <Label className="text-xs text-muted-foreground">Created by</Label>
// //               <p className="font-medium">{prompt.createdBy}</p>
// //             </div>
// //             <div className="space-y-1">
// //               <Label className="text-xs text-muted-foreground">Submitted</Label>
// //               <p>{new Date(prompt.submittedAt).toLocaleDateString()}</p>
// //             </div>
// //             <div className="space-y-1">
// //               <Label className="text-xs text-muted-foreground">Status</Label>
// //               <span className={cn(
// //                 "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
// //                 prompt.status === "approved" && "bg-green-100 text-green-700",
// //                 prompt.status === "pending" && "bg-yellow-100 text-yellow-700",
// //                 prompt.status === "rejected" && "bg-red-100 text-red-700"
// //               )}>
// //                 {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
// //               </span>
// //             </div>
// //             <div className="space-y-1">
// //               <Label className="text-xs text-muted-foreground">Engagement</Label>
// //               <p>👍 {prompt.likes} · 👎 {prompt.dislikes}</p>
// //             </div>
// //           </div>

// //           {/* Existing Feedbacks */}
// //           {existingFeedbacks.length > 0 && (
// //             <div className="space-y-2 border-t border-border pt-3">
// //               <Label className="text-sm font-semibold">💬 Previous Feedback</Label>
// //               <div className="space-y-2 max-h-[200px] overflow-y-auto">
// //                 {existingFeedbacks.map((fb) => (
// //                   <div key={fb.id} className="bg-muted/20 p-3 rounded-lg">
// //                     <div className="flex justify-between items-start mb-1">
// //                       <span className="text-xs font-semibold">{fb.userName}</span>
// //                       <span className="text-xs text-muted-foreground">
// //                         {new Date(fb.createdAt).toLocaleDateString()}
// //                       </span>
// //                     </div>
// //                     <p className="text-sm">{fb.feedback}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {/* New Feedback Section */}
// //           <div className="space-y-2 border-t border-border pt-3">
// //             <Label className="text-sm font-semibold">
// //               {userRole === "moderator" ? "📋 Add Review Notes" : "💬 Your Feedback"}
// //             </Label>
// //             <Textarea
// //               placeholder={
// //                 userRole === "moderator" 
// //                   ? "Add review notes, suggestions for improvement, or approval comments..."
// //                   : "Share your thoughts about this prompt. What works well? What could be improved?"
// //               }
// //               value={feedback}
// //               onChange={(e) => setFeedback(e.target.value)}
// //               rows={4}
// //               className="resize-none"
// //             />
// //             <p className="text-xs text-muted-foreground">
// //               {userRole === "moderator" 
// //                 ? "These notes will be visible to the employee." 
// //                 : "Your feedback helps improve the prompt quality."}
// //             </p>
// //           </div>
// //         </div>

// //         <DialogFooter>
// //           <Button variant="outline" onClick={onClose}>
// //             Close
// //           </Button>
// //           <Button 
// //             onClick={handleSaveFeedback} 
// //             disabled={!feedback.trim() || isSubmitting}
// //           >
// //             {isSubmitting ? "Saving..." : (userRole === "moderator" ? "Save Review" : "Submit Feedback")}
// //           </Button>
// //         </DialogFooter>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // };

// // export default PromptDetailDialog;

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";
// import { Prompt } from "@/data/prompts";
// import RichTextEditor from "./RichTextEditor";
// import { Pencil, Save, X } from "lucide-react";

// interface PromptDetailDialogProps {
//   prompt: Prompt | null;
//   isOpen: boolean;
//   onClose: () => void;
//   onSaveFeedback?: (promptId: number, feedback: string) => void;
//   onEditPrompt?: (promptId: number, updatedPrompt: Partial<Prompt>) => void;
//   existingFeedbacks?: Array<{
//     id: number;
//     userName: string;
//     feedback: string;
//     createdAt: string;
//   }>;
//   userRole?: "employee" | "moderator";
//   userName?: string;
// }

// const PromptDetailDialog = ({ 
//   prompt, 
//   isOpen, 
//   onClose, 
//   onSaveFeedback,
//   onEditPrompt,
//   existingFeedbacks = [],
//   userRole = "employee",
//   userName = ""
// }: PromptDetailDialogProps) => {
//   const [feedback, setFeedback] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editPromptText, setEditPromptText] = useState("");
//   const [editQuestion, setEditQuestion] = useState("");
//   const [editSteps, setEditSteps] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   if (!prompt) return null;

//   const handleSaveFeedback = async () => {
//     if (!feedback.trim()) return;
//     setIsSubmitting(true);
//     if (onSaveFeedback) {
//       await onSaveFeedback(prompt.id, feedback);
//     }
//     setFeedback("");
//     setIsSubmitting(false);
//     onClose();
//   };

//   const handleEditClick = () => {
//     setEditPromptText(prompt.promptText);
//     setEditQuestion(prompt.question);
//     setEditSteps(prompt.steps);
//     setIsEditing(true);
//   };

//   const handleSaveEdit = async () => {
//      console.log("Saving prompt text with HTML:", editPromptText); 
//     setIsSaving(true);
//     if (onEditPrompt) {
//       await onEditPrompt(prompt.id, {
//         promptText: editPromptText,
//         question: editQuestion,
//         steps: editSteps,
//       });
//     }
//     setIsEditing(false);
//     setIsSaving(false);
//     onClose();
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setEditPromptText("");
//     setEditQuestion("");
//     setEditSteps("");
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 flex-wrap justify-between">
//             <div className="flex items-center gap-2 flex-wrap">
//               <span>Prompt Details</span>
//               <div className="flex gap-1">
//                 <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stageBadgeClass(prompt.stage))}>
//                   {prompt.stage}
//                 </span>
//                 {!isEditing && (
//                   <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", stepsBadgeClass(prompt.stage))}>
//                     {prompt.steps}
//                   </span>
//                 )}
//               </div>
//             </div>
//             {/* Edit button for moderators */}
//             {userRole === "moderator" && !isEditing && (
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={handleEditClick}
//                 className="gap-1"
//               >
//                 <Pencil className="w-3.5 h-3.5" />
//                 Edit Prompt
//               </Button>
//             )}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Edit Mode */}
//           {isEditing ? (
//             <>
//               {/* Edit Steps */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-semibold">Steps</Label>
//                 <input
//                   type="text"
//                   value={editSteps}
//                   onChange={(e) => setEditSteps(e.target.value)}
//                   className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                   placeholder="Enter steps..."
//                 />
//               </div>

//               {/* Edit Question */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-semibold">📌 Question Addressed</Label>
//                 <Textarea
//                   value={editQuestion}
//                   onChange={(e) => setEditQuestion(e.target.value)}
//                   rows={2}
//                   className="resize-none"
//                   placeholder="What question does this prompt answer?"
//                 />
//               </div>

//               {/* Edit Prompt with Rich Text */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-semibold">📝 Prompt (Rich Text)</Label>
//                 <RichTextEditor
//                   value={editPromptText}
//                   onChange={setEditPromptText}
//                   placeholder="Edit your prompt with formatting (bold, italic, lists)..."
//                   readOnly={false}
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   You can use bold, italic, bullet points, and numbered lists to format the prompt.
//                 </p>
//               </div>

//               {/* Edit Actions */}
//               <div className="flex justify-end gap-2 pt-2">
//                 <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
//                   <X className="w-4 h-4 mr-1" />
//                   Cancel
//                 </Button>
//                 <Button onClick={handleSaveEdit} disabled={isSaving}>
//                   <Save className="w-4 h-4 mr-1" />
//                   {isSaving ? "Saving..." : "Save Changes"}
//                 </Button>
//               </div>
//             </>
//           ) : (
//             <>
//               {/* View Mode - Question */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-semibold">📌 Question Addressed</Label>
//                 <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg">
//                   {prompt.question}
//                 </p>
//               </div>

//               {/* View Mode - Prompt Text (Rich Text) */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-semibold">📝 Prompt</Label>
//                 <div className="border border-border rounded-lg p-4 bg-card">
//                   <RichTextEditor
//                     value={prompt.promptText}
//                     onChange={() => {}}
//                     readOnly={true}
//                   />
//                 </div>
//               </div>

//               {/* Metadata */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">Created by</Label>
//                   <p className="font-medium">{prompt.createdBy}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">Steps</Label>
//                   <p>{prompt.steps}</p>
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">Status</Label>
//                   <span className={cn(
//                     "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
//                     prompt.status === "approved" && "bg-green-100 text-green-700",
//                     prompt.status === "pending" && "bg-yellow-100 text-yellow-700",
//                     prompt.status === "rejected" && "bg-red-100 text-red-700"
//                   )}>
//                     {prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
//                   </span>
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs text-muted-foreground">Engagement</Label>
//                   <p>👍 {prompt.likes} · 👎 {prompt.dislikes}</p>
//                 </div>
//               </div>

//               {/* Existing Feedbacks */}
//               {existingFeedbacks.length > 0 && (
//                 <div className="space-y-2 border-t border-border pt-3">
//                   <Label className="text-sm font-semibold">💬 Previous Feedback</Label>
//                   <div className="space-y-2 max-h-[200px] overflow-y-auto">
//                     {existingFeedbacks.map((fb) => (
//                       <div key={fb.id} className="bg-muted/20 p-3 rounded-lg">
//                         <div className="flex justify-between items-start mb-1">
//                           <span className="text-xs font-semibold">{fb.userName}</span>
//                           <span className="text-xs text-muted-foreground">
//                             {new Date(fb.createdAt).toLocaleDateString()}
//                           </span>
//                         </div>
//                         <p className="text-sm">{fb.feedback}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* New Feedback Section */}
//               <div className="space-y-2 border-t border-border pt-3">
//                 <Label className="text-sm font-semibold">
//                   {userRole === "moderator" ? "📋 Add Review Notes" : "💬 Your Feedback"}
//                 </Label>
//                 <Textarea
//                   placeholder={
//                     userRole === "moderator" 
//                       ? "Add review notes, suggestions for improvement, or approval comments..."
//                       : "Share your thoughts about this prompt. What works well? What could be improved?"
//                   }
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                   rows={4}
//                   className="resize-none"
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   {userRole === "moderator" 
//                     ? "These notes will be visible to the employee." 
//                     : "Your feedback helps improve the prompt quality."}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>

//         {!isEditing && (
//           <DialogFooter>
//             <Button variant="outline" onClick={onClose}>
//               Close
//             </Button>
//             <Button 
//               onClick={handleSaveFeedback} 
//               disabled={!feedback.trim() || isSubmitting}
//             >
//               {isSubmitting ? "Saving..." : (userRole === "moderator" ? "Save Review" : "Submit Feedback")}
//             </Button>
//           </DialogFooter>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default PromptDetailDialog;