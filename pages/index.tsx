import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../controllers/hooks/use_auth";

export default function DashboardIndex() {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth?.rol === 0) router.push("/dashboard/admin");
    else if (auth?.rol === 1) router.push("/dashboard/bodeguero");
    else if (auth?.rol === 2) router.push("/dashboard/cliente");
    else router.push("/login");
  }, [auth, router]);

  return (
  <div className="h-screen flex justify-center items-center text-blue-800 font-semibold text-xl">
    Redireccionando al panel...
  </div>
);

}
