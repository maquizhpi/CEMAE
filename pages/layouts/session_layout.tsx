import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState } from "react";
import LoadingContainer from "../components/loading_container";
import { useRouter } from "next/router";
import LoginPage from "../login";

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

  useEffect(() => {
    setLoggedIn(auth !== null);
  }, [auth]);

  return (
    <LoadingContainer visible={loggedIn === null && !isPublicRoute}>
      {loggedIn || isPublicRoute ? <>{props.children}</> : <LoginPage />}
    </LoadingContainer>
  );
};

export default SessionLayout;
