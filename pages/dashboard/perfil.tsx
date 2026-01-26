/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import UserModal from "../components/modals/user";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import { toast } from "react-toastify";
import { UserRole, Usuario, ResponseData } from "../../models";

const PerfilUsuario = () => {
  const { auth, login } = useAuth();

  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const getRolLabel = (rol: UserRole) => {
    if (rol === 0) return "Administrador";
    if (rol === 1) return "Bodeguero";
    if (rol === 2) return "Cliente";
    return "Usuario";
  };

  // 1) Cargar SIEMPRE datos frescos desde la BD y sincronizar auth
  useEffect(() => {
    const refreshFromDB = async () => {
      if (!auth) return;

      try {
        setLoadingPerfil(true);

        const resp: ResponseData = await HttpClient(
          "/api/user",
          "GET",
          auth.usuario,
          auth.rol
        );

        const users: Usuario[] = (resp.data as Usuario[]) ?? [];

        // Busca por id / _id (más fiable) o por usuario
        const authId = (auth as any).id ?? (auth as any)._id;
        const fresh =
          users.find((u: any) => u.id === authId || u._id === authId) ||
          users.find(
            (u) =>
              (u.usuario ?? "").toLowerCase() ===
              (auth.usuario ?? "").toLowerCase()
          );

        if (fresh) {
          // Actualiza contexto + localStorage
          login({ ...(auth as any), ...(fresh as any) });
        }
      } catch (e) {
        // No bloquea la UI, pero informa
        toast.warning("No se pudo actualizar el perfil desde la base de datos.");
      } finally {
        setLoadingPerfil(false);
      }
    };

    refreshFromDB();
    // Importante: se refresca cuando cambia el usuario autenticado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.usuario]);

  if (!auth || loadingPerfil) return <div>Cargando usuario...</div>;

  const showModal = () => {
    setEditingUser(auth as any);
    setModalVisible(true);
  };

  const hideModal = () => {
    setEditingUser(null);
    setModalVisible(false);
  };

  // 2) Guardar cambios y sincronizar auth inmediatamente
  const handleDone = async (updated: Usuario) => {
    try {
      // Asegura que el payload tenga id (tu backend actualiza por user.id)
      const payload: any = {
        ...updated,
        id: (updated as any).id ?? (auth as any).id ?? (auth as any)._id,
      };

      const response: ResponseData = await HttpClient(
        "/api/user",
        "PUT",
        auth.usuario,
        auth.rol,
        payload
      );

      if (!response.success) {
        toast.warning(response.message);
        return;
      }

      toast.success("Perfil actualizado");

      // Si tu backend NO devuelve data del usuario, refrescamos desde la BD
      // para que el perfil muestre lo real guardado.
      const resp: ResponseData = await HttpClient(
        "/api/user",
        "GET",
        auth.usuario,
        auth.rol
      );

      const users: Usuario[] = (resp.data as Usuario[]) ?? [];

      const authId = (auth as any).id ?? (auth as any)._id ?? payload.id;
      const fresh =
        users.find((u: any) => u.id === authId || u._id === authId) ||
        users.find(
          (u) =>
            (u.usuario ?? "").toLowerCase() ===
            (auth.usuario ?? "").toLowerCase()
        );

      if (fresh) {
        login({ ...(auth as any), ...(fresh as any) });
      } else {
        // fallback mínimo
        login({ ...(auth as any), ...(payload as any) });
      }

      hideModal();
    } catch (e) {
      toast.warning("Error al actualizar el perfil.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6">
        <Sidebar />
      </div>

      <div className="w-full md:w-5/6 bg-blue-100 overflow-y-scroll">
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <h2 className="text-3xl text-center text-blue-800 font-bold mb-2">
              MI PERFIL
            </h2>

            <p className="text-center text-gray-500 mb-6">
              Información del usuario autenticado
            </p>

            {/* BOTÓN EDITAR */}
            <div className="flex justify-end mb-6">
              <button
                onClick={showModal}
                className="bg-transparent hover:bg-blue-600 text-blue-600 font-semibold hover:text-white py-2 px-4 border border-blue-600 hover:border-transparent rounded"
              >
                Editar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* FOTO */}
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                  {auth.imagen && auth.imagen.trim() !== "" ? (
                    <img
                      src={auth.imagen}
                      alt="Foto de perfil 1"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl text-gray-600">
                      {auth.nombre?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="mt-4 font-semibold">{auth.nombre}</p>
                <p className="text-sm text-gray-500">{auth.usuario}</p>
              </div>

              {/* DATOS */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre completo" value={auth.nombre} />
                <Input label="Correo" value={auth.correo} />
                <Input label="Teléfono" value={auth.telefono} />
                <Input label="Usuario" value={auth.usuario} />
                <Input label="Identificación" value={auth.identificacion} />
                <Input label="Rol" value={getRolLabel(auth.rol)} />
                <Input label="Estado" value={auth.estado} />
              </div>
            </div>

            {/* MODAL */}
            <UserModal
              visible={modalVisible}
              close={hideModal}
              initialData={editingUser ?? undefined}
              onDone={handleDone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;

const Input = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={value || ""}
      disabled
      className="w-full border rounded-lg px-3 py-2 bg-gray-100"
    />
  </div>
);
