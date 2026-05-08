import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { Prompt } from "@/data/prompts";
import { cn } from "@/lib/utils";
import { stageBadgeClass, stepsBadgeClass } from "@/lib/stageColors";

type Reaction = "like" | "dislike" | undefined;

interface PromptCardProps {
  prompt: Prompt;
  userReaction: Reaction;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
}

const PromptCard = ({ prompt, userReaction, onLike, onDislike }: PromptCardProps) => {
  const liked = userReaction === "like";
  const disliked = userReaction === "dislike";

  return (
    <article className="bg-card rounded-xl p-5 mb-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stageBadgeClass(prompt.stage))}>
          {prompt.stage}
        </span>
        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", stepsBadgeClass(prompt.stage))}>
          {prompt.steps}
        </span>
      </div>

      <p className="italic text-muted-foreground mb-3 text-sm">
        📌 {prompt.question}
      </p>

      <div className="bg-prompt-box border border-border rounded-lg p-4 mb-4 text-sm text-foreground leading-relaxed">
        {prompt.promptText}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Created by: <span className="font-medium text-foreground">{prompt.createdBy}</span>
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onLike(prompt.id)}
            aria-pressed={liked}
            aria-label="Like prompt"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border-0",
              liked
                ? "bg-like text-like-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{prompt.likes}</span>
          </button>

          <button
            onClick={() => onDislike(prompt.id)}
            aria-pressed={disliked}
            aria-label="Dislike prompt"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border-0",
              disliked
                ? "bg-dislike text-dislike-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{prompt.dislikes}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PromptCard;