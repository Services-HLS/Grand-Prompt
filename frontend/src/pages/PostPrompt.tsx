import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { usePrompts } from "@/context/PromptsContext";
import { STAGES } from "@/data/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const schema = z.object({
  stage: z.string().min(1, "Stage is required"),
  steps: z.string().trim().min(1, "Steps are required").max(120),
  question: z.string().trim().min(1, "Question is required").max(500),
  promptText: z.string().trim().min(10, "Prompt must be at least 10 characters").max(4000),
});

const PostPrompt = () => {
  const { user } = useAuth();
  const { addPrompt } = usePrompts();
  const navigate = useNavigate();

  const [stage, setStage] = useState<string>(STAGES[0]);
  const [steps, setSteps] = useState("");
  const [question, setQuestion] = useState("");
  const [promptText, setPromptText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ stage, steps, question, promptText });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    const promptPlainText = stripHtml(parsed.data.promptText);
    if (promptPlainText.length < 10 || promptPlainText.length > 4000) {
      setErrors({ promptText: "Prompt must be between 10 and 4000 characters" });
      return;
    }
    setErrors({});
    if (!user) return;
    addPrompt({
      stage: parsed.data.stage,
      steps: parsed.data.steps,
      question: parsed.data.question,
      promptText: parsed.data.promptText,
      createdBy: user.name,
      employeeId: user.email,
    });
    toast.success("Prompt submitted for review");
    navigate("/my-prompts");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="bg-gradient-header text-white rounded-2xl p-6 mb-6 shadow-card">
        <h1 className="text-2xl font-bold">Post a New Prompt</h1>
        <p className="text-sm opacity-90 mt-1">Submitted prompts will be reviewed by a moderator.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.stage && <p className="text-sm text-destructive">{errors.stage}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps">Steps</Label>
          <Input
            id="steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="e.g. Opportunity identification"
            maxLength={120}
          />
          {errors.steps && <p className="text-sm text-destructive">{errors.steps}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">Question Addressed</Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What question does this prompt help answer?"
            rows={2}
            maxLength={500}
          />
          {errors.question && <p className="text-sm text-destructive">{errors.question}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptText">Prompt</Label>
          <RichTextEditor
            value={promptText}
            onChange={setPromptText}
            placeholder="Write the full prompt text..."
            className="min-h-[220px]"
          />
          {errors.promptText && <p className="text-sm text-destructive">{errors.promptText}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Submit for Review</Button>
        </div>
      </form>
    </div>
  );
};

export default PostPrompt;