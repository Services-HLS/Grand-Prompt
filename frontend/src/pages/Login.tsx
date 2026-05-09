

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
  const { user, login, getAllUsers } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [quickUsers, setQuickUsers] = useState<Array<{ name: string; email: string; role: "moderator" | "employee" }>>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const moderators = quickUsers.filter((u) => u.role === "moderator");
  const employees = quickUsers.filter((u) => u.role === "employee");

  useEffect(() => {
    if (user) navigate(user.role === "moderator" ? "/pending" : "/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setUsersLoading(true);
      const users = await getAllUsers();
      if (!mounted) return;
      setQuickUsers(users);
      setUsersLoading(false);
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [getAllUsers]);

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
              <CardContent className="grid gap-2">
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : moderators.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No moderators found in backend.</p>
                ) : (
                  moderators.map((moderator) => (
                    <Button
                      key={moderator.email}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => quickLogin(moderator.email, "Password@123")}
                    >
                      👤 {moderator.name}
                    </Button>
                  ))
                )}
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
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : employees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No employees found in backend.</p>
                ) : (
                  employees.map((employee) => (
                    <Button
                      key={employee.email}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => quickLogin(employee.email, "Password@123")}
                    >
                      👤 {employee.name}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Login;