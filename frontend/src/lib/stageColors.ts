// Maps a stage string (e.g. "1. Idea development") to Tailwind classes
// for the Stage badge and the Steps badge, in the George Institute palette.

export type StageFamily = 1 | 2 | 3;

export const getStageFamily = (stage: string): StageFamily => {
  const trimmed = stage.trim();
  if (trimmed.startsWith("2")) return 2;
  if (trimmed.startsWith("3")) return 3;
  return 1;
};

export const stageBadgeClass = (stage: string): string => {
  const f = getStageFamily(stage);
  if (f === 2) return "bg-stage-2 text-stage-2-foreground";
  if (f === 3) return "bg-stage-3 text-stage-3-foreground";
  return "bg-stage-1 text-stage-1-foreground";
};

export const stepsBadgeClass = (stage: string): string => {
  const f = getStageFamily(stage);
  if (f === 2) return "bg-steps-2 text-steps-2-foreground";
  if (f === 3) return "bg-steps-3 text-steps-3-foreground";
  return "bg-steps-1 text-steps-1-foreground";
};