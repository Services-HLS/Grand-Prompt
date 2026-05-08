import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "@/context/AuthContext";

const RequireAuth = ({ children, role }: { children: ReactNode; role?: Role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "moderator" ? "/pending" : "/"} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;