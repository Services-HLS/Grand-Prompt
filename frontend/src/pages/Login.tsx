

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Users, UserCog } from "lucide-react";

// const Login = () => {
//   const { user, login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) navigate(user.role === "moderator" ? "/pending" : "/", { replace: true });
//   }, [user, navigate]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     const res = login(email, password);
//     if (res.ok === false) setError(res.error);
//   };

//   const quickLogin = (email: string, pwd: string) => {
//     setEmail(email);
//     setPassword(pwd);
//     const res = login(email, pwd);
//     if (res.ok === false) setError(res.error);
//   };

//   return (
//     <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
//       <div className="w-full max-w-md">
//         <div className="bg-gradient-header text-white rounded-2xl p-6 mb-4 text-center shadow-card">
//           <h1 className="text-2xl font-bold">📝 Grant Writing Prompts</h1>
//           <p className="text-sm opacity-90 mt-1">Sign in to continue</p>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-6 space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               autoComplete="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               autoComplete="current-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           {error && (
//             <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
//           )}
//           <Button type="submit" className="w-full">
//             Sign in
//           </Button>
//         </form>

//         {/* Quick Login Buttons */}
//         <div className="mt-6 space-y-4">
//           {/* Moderator Section */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <UserCog className="w-4 h-4" />
//                 Moderator
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("anchal@example.com", "mod123")}
//               >
//                 👤 Anchal Rastogi (Moderator)
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Employees Section */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Users className="w-4 h-4" />
//                 Employees
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="grid gap-2">
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("mahesh@example.com", "employee123")}
//               >
//                 👤 Mahesh Gandla
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("stephanie@example.com", "employee123")}
//               >
//                 👤 Stephanie Keegan
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("jonny@example.com", "employee123")}
//               >
//                 👤 Jonny Lo
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("jeremy@example.com", "employee123")}
//               >
//                 👤 Jeremy Wang
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full justify-start"
//                 onClick={() => quickLogin("deeksha@example.com", "employee123")}
//               >
//                 👤 Deeksha Bhardwaj
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         <p className="text-xs text-center text-muted-foreground mt-4">
//           Demo credentials: Use any email above with password "employee123" (or "mod123" for moderator)
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

// Login.tsx - Updated for full width

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog } from "lucide-react";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(user.role === "moderator" ? "/pending" : "/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (res.ok === false) setError(res.error);
  };

  const quickLogin = async (email: string, pwd: string) => {
    setEmail(email);
    setPassword(pwd);
    const res = await login(email, pwd);
    if (res.ok === false) setError(res.error);
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      {/* Changed from max-w-md to w-full max-w-7xl for full width with some constraint */}
      <div className="w-full max-w-7xl">
        {/* Header - now full width */}
        <div className="bg-gradient-header text-white rounded-2xl p-6 mb-4 text-center shadow-card">
          <h1 className="text-2xl font-bold">📝 Grant Writing Prompts</h1>
          <p className="text-sm opacity-90 mt-1">Sign in to continue</p>
        </div>

        {/* Two column layout for main content and quick login side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form Column */}
          <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          {/* Quick Login Column */}
          <div className="space-y-4">
            {/* Moderator Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Moderator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("moderator@example.com", "Password@123")}
                >
                  👤 Moderator (Backend)
                </Button>
              </CardContent>
            </Card>

            {/* Employees Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Employees
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("jonny@example.com", "Password@123")}
                >
                  👤 Jonny Lo
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("karthika@example.com", "Password@123")}
                >
                  👤 Karthika Kumar
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("admin@example.com", "Password@123")}
                >
                  👤 Admin User
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("moderator@example.com", "Password@123")}
                >
                  👤 Moderator One
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => quickLogin("jonny@example.com", "Password@123")}
                >
                  👤 Jonny Lo (repeat)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Demo credentials (seeded backend): password for all users is "Password@123"
        </p>
      </div>
    </div>
  );
};

export default Login;