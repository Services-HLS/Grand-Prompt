import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Image */}
      <div className="relative">
        <img 
          src="/george-institute-logo.png" 
          alt="The George Institute for Global Health" 
          className="h-10 w-auto object-contain"
          onError={(e) => {
            // If image doesn't load, show SVG placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const svg = document.createElement('div');
              svg.innerHTML = `<svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#1a56db" stroke="#1e3a8a" stroke-width="2"/>
                <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-weight="bold" font-family="Arial">G</text>
              </svg>`;
              parent.appendChild(svg.firstChild as Node);
            }
          }}
        />
      </div>
      
      {/* Text Logo */}
      {showText && (
        <div className="hidden sm:block">
          <div className="text-sm font-bold text-foreground leading-tight">
            The George Institute
          </div>
          <div className="text-xs text-muted-foreground">
            for Global Health
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;