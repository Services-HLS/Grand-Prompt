// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import { PROMPT_CATEGORIES, PromptCategory } from "@/data/promptCategories";
// import { Prompt } from "@/data/prompts";

// type CategoryContextValue = {
//   currentCategory: PromptCategory;
//   categories: PromptCategory[];
//   setCurrentCategory: (categoryId: string) => void;
//   getCategoryPrompts: () => Prompt[];
// };

// const STORAGE_KEY = "grant-prompts-selected-category";

// const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

// export const CategoryProvider = ({ children }: { children: ReactNode }) => {
//   const [currentCategory, setCurrentCategoryState] = useState<PromptCategory>(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const found = PROMPT_CATEGORIES.find(c => c.id === saved);
//         if (found) return found;
//       }
//     } catch { /* ignore */ }
//     return PROMPT_CATEGORIES[0]; // Default to Grant Writing
//   });

//   const setCurrentCategory = (categoryId: string) => {
//     const category = PROMPT_CATEGORIES.find(c => c.id === categoryId);
//     if (category) {
//       setCurrentCategoryState(category);
//       localStorage.setItem(STORAGE_KEY, categoryId);
//     }
//   };

//   const getCategoryPrompts = () => {
//     return currentCategory.prompts;
//   };

//   return (
//     <CategoryContext.Provider
//       value={{
//         currentCategory,
//         categories: PROMPT_CATEGORIES,
//         setCurrentCategory,
//         getCategoryPrompts,
//       }}
//     >
//       {children}
//     </CategoryContext.Provider>
//   );
// };

// export const useCategory = () => {
//   const ctx = useContext(CategoryContext);
//   if (!ctx) throw new Error("useCategory must be used inside CategoryProvider");
//   return ctx;
// };

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { PROMPT_CATEGORIES, PromptCategory } from "@/data/promptCategories";
import { Prompt } from "@/data/prompts";
import { usePrompts } from "./PromptsContext"; // Import this

type CategoryContextValue = {
  currentCategory: PromptCategory;
  categories: PromptCategory[];
  setCurrentCategory: (categoryId: string) => void;
  getCategoryPrompts: () => Prompt[];
};

const STORAGE_KEY = "grant-prompts-selected-category";

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const { prompts: allPrompts } = usePrompts(); // Get all prompts from context
  const [currentCategory, setCurrentCategoryState] = useState<PromptCategory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = PROMPT_CATEGORIES.find(c => c.id === saved);
        if (found) return found;
      }
    } catch { /* ignore */ }
    return PROMPT_CATEGORIES[0];
  });

  const setCurrentCategory = (categoryId: string) => {
    const category = PROMPT_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      setCurrentCategoryState(category);
      localStorage.setItem(STORAGE_KEY, categoryId);
    }
  };

  const getCategoryPrompts = () => {
    return allPrompts.filter((p) => p.category === currentCategory.id);
  };

  return (
    <CategoryContext.Provider
      value={{
        currentCategory,
        categories: PROMPT_CATEGORIES,
        setCurrentCategory,
        getCategoryPrompts,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategory must be used inside CategoryProvider");
  return ctx;
};