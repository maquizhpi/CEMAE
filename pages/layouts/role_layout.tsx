import { useAuth } from "../../controllers/hooks/use_auth";
import { UserRole } from "../../models";
import { CheckPermissions } from "../../controllers/utils/check_permissions";

// Componente de layout para manejar roles de usuario
type Props = {
  permissions: Array<UserRole>;
  children: React.ReactNode;
};

// Componente que verifica si el usuario tiene los permisos necesarios
const RoleLayout = (props: Props) => {
  const { auth } = useAuth();
  if (CheckPermissions(auth, props.permissions)) return <>{props.children}</>;
  return <div>No tiene permiso para entrar a esta Página</div>;
};

export default RoleLayout;
