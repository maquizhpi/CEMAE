import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState } from "react";
import LoadingContainer from "../components/loading_container";
import { useRouter } from "next/router";
import LoginPage from "./login/login";


type Props = {
  rol?: Array<number>;
  children: React.ReactNode;
};

// controla el inicio de sesión en la app
const SessionLayout = (props: Props) => {
  const { auth } = useAuth();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const publicRoutes = ["/login", "/registro", "/recuperar"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  // Verifica si el usuario está autenticado
  useEffect(() => {
    setLoggedIn(auth !== null);
  }, [auth]);

  // Redirige a la página de inicio de sesión si el usuario no está autenticado
  return (
    <LoadingContainer visible={loggedIn === null && !isPublicRoute}>
      {loggedIn || isPublicRoute ? <>{props.children}</> : <LoginPage />}
    </LoadingContainer>
  );
};

export default SessionLayout;
