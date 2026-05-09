import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/context/CategoryContext";

const CategoryDropdown = () => {
  const { currentCategory, categories, setCurrentCategory } = useCategory();

  return (
    <Select value={currentCategory.id} onValueChange={setCurrentCategory}>
      <SelectTrigger className="w-[140px] sm:w-[180px] bg-primary/10 border-primary/20">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentCategory.icon}</span>
            <span>{currentCategory.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({category.prompts.length})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryDropdown;