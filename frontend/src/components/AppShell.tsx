// import { ReactNode } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { LogOut } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { useCategory } from "@/context/CategoryContext"; // Add this import
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import CategoryDropdown from "./CategoryDropdown";

// type NavItem = { to: string; label: string };

// const employeeNav: NavItem[] = [
//   { to: "/", label: "Browse Prompts" },
//   { to: "/post", label: "Post Prompt" },
//   { to: "/my-prompts", label: "My Prompts" },
// ];

// const moderatorNav: NavItem[] = [
//   { to: "/", label: "Browse Prompts" },
//   { to: "/pending", label: "Pending Approvals" },
//   { to: "/all", label: "All Prompts" },
//   { to: "/analytics", label: "Analytics" },
// ];

// const AppShell = ({ children }: { children: ReactNode }) => {
//   const { user, logout } = useAuth();
//   const { currentCategory } = useCategory(); // Add this line
//   const navigate = useNavigate();
//   const items = user?.role === "moderator" ? moderatorNav : employeeNav;

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen bg-app-bg">
//       <nav className="bg-card border-b border-border sticky top-0 z-10 shadow-card">
//         <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 justify-between">
//           <div className="flex items-center gap-6 flex-wrap">
//             {/* Brand with dropdown */}
//             <div className="flex items-center gap-3">
//               {/* Changed: Show category icon and name instead of hardcoded text */}
//               {/* <span className="font-bold text-lg">
//                 {currentCategory.icon} {currentCategory.name} Prompts
//               </span> */}
//               <CategoryDropdown />
//             </div>
//             <div className="flex flex-wrap gap-1">
//               {items.map((item) => (
//                 <NavLink
//                   key={item.to}
//                   to={item.to}
//                   end
//                   className={({ isActive }) =>
//                     cn(
//                       "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
//                       isActive
//                         ? "bg-primary text-primary-foreground"
//                         : "text-muted-foreground hover:bg-muted hover:text-foreground",
//                     )
//                   }
//                 >
//                   {item.label}
//                 </NavLink>
//               ))}
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {user && (
//               <div className="text-right hidden sm:block">
//                 <div className="text-sm font-medium">{user.name}</div>
//                 <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
//               </div>
//             )}
//             <Button variant="outline" size="sm" onClick={handleLogout}>
//               <LogOut className="w-4 h-4 mr-1" /> Logout
//             </Button>
//           </div>
//         </div>
//       </nav>
//       <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
//     </div>
//   );
// };

// export default AppShell;

import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Facebook, Instagram, Linkedin, LogOut, Twitter, User, Youtube } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CategoryDropdown from "./CategoryDropdown";

type NavItem = { to: string; label: string };

const employeeNav: NavItem[] = [
  { to: "/", label: "Browse Prompts" },
  { to: "/post", label: "Post Prompt" },
  { to: "/my-prompts", label: "My Prompts" },
];

const moderatorNav: NavItem[] = [
  { to: "/", label: "Browse Prompts" },
  { to: "/pending", label: "Pending Approvals" },
  { to: "/all", label: "All Prompts" },
  { to: "/archive", label: "Archive" },
  { to: "/analytics", label: "Analytics" },
];

const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.role === "moderator" ? moderatorNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* 
          NAVBAR: Using the deep purple (#4c2f73) from George Institute 
      */}
      <nav className="bg-[#4c2f73] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-full mx-auto px-3 sm:px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* LEFT SECTION: Logo and Brand Area */}
            <div className="flex min-w-0 items-center gap-3 sm:gap-6">
              <NavLink to="/" className="flex-shrink-0 transition-opacity hover:opacity-90">
                <img
                  src="/george-institute-logo.png"
                  alt="The George Institute"
                  className="h-9 sm:h-10 md:h-12 w-auto object-contain"
                />
              </NavLink>

              {/* Vertical Divider (Hidden on small screens) */}
              <div className="hidden md:block h-8 w-[1px] bg-white/20" />

              {/* Category Dropdown Area */}
              <div className="flex items-center min-w-[140px] sm:min-w-[180px]">
                <CategoryDropdown />
              </div>
            </div>

            {/* RIGHT SECTION: User Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 md:border-l md:border-white/20 md:ml-2 md:pl-4">
              {user && (
                <div className="hidden xl:flex flex-col items-end mr-2">
                  <span className="text-xs font-black uppercase tracking-tighter">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-white/50 uppercase font-bold">
                    {user.role}
                  </span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="bg-transparent border border-white/40 text-white hover:bg-white hover:text-[#4c2f73] font-bold rounded-none px-2 sm:px-4"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">LOGOUT</span>
              </Button>
            </div>

          </div>

          {/* NAVIGATION TABS: visible on all sizes, scroll on mobile */}
          <div className="mt-2 border-t border-white/20 pt-2">
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold tracking-wide transition-all border-b-2",
                      isActive
                        ? "text-white border-white"
                        : "text-white/70 border-transparent hover:text-white hover:border-white/30"
                    )
                  }
                >
                  {item.label.toUpperCase()}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA - flex-grow ensures footer stays at bottom */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* FOOTER: Matching the attached image */}
      <footer className="bg-[#4c2f73] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

            {/* Column 1: Logo and Socials */}
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-start gap-4">
                {/* 1. The Text Part */}
                <div className="text-white">
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                    The<br />
                    George<br />
                    Institute
                  </h2>
                  <p className="text-xs font-medium mt-1 opacity-90">
                    for Global Health
                  </p>
                </div>

                {/* 2. Your Separate Ticket Mark Logo */}
                <img
                  src="/favicon.ico" // Use your separate icon file here
                  alt="Icon"
                  className="h-16 w-auto mt-1"
                />
              </div>
             <div className="flex gap-2">
  <SocialIcon 
    icon={<Twitter size={18} />} 
    href="https://twitter.com/georgeinstitute" 
  />
  <SocialIcon 
    icon={<Facebook size={18} />} 
    href="https://www.facebook.com/thegeorgeinstitute" 
  />
  <SocialIcon 
    icon={<Linkedin size={18} />} 
    href="https://www.linkedin.com/school/george-institute/" 
  />
</div>
            </div>

            {/* Column 2: Quick Links & Acknowledgement */}
            <div className="md:col-span-8 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold mb-4 uppercase tracking-wider">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>
                      <a
                        href="https://www.georgeinstitute.org/our-research"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Our research
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.georgeinstitute.org/our-impact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Our impact
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="pt-8 sm:pt-0">
                  <ul className="space-y-2 text-sm text-white/80 mt-10 sm:mt-10">
                    <li >
                      <a
                        href="https://www.georgeinstitute.org/news-and-media"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        News & media
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.georgeinstitute.org/contact-us"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Contact us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3 uppercase tracking-wider">Acknowledgement of Country</h4>
                <p className="text-sm leading-relaxed text-white/80">
                  The George Institute acknowledges First Peoples and the Traditional Custodians of the many lands upon which we live and work. We pay our respects to Elders past and present, and thank them for ongoing custodianship of waters, lands and skies.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-3 uppercase tracking-wider">Our Partners</h4>
                <p className="text-sm leading-relaxed text-white/80">
                  The George Institute for Global Health is proud to work in partnership with UNSW Sydney, Imperial College London and the Manipal Academy of Higher Education, India.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-[8px] text-center font-bold">REGISTERED<br />CHARITY</span>
                </div>
                <p className="text-xs text-white/60">
                  The George Institute for Global Health is a registered charity. ABN 90 085 953 331
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper component for Social Icons to keep code clean
const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="border border-white/40 p-2 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center rounded-sm"
  >
    {icon}
  </a>
);

export default AppShell;