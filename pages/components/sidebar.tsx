/* eslint-disable @next/next/no-html-link-for-pages */
import {
  MdOutlineSpaceDashboard,
  MdOutlineSettings,
  MdOutlineLogout,
  MdPets,
  MdPeople,
  MdStore,
  MdAttachMoney,
  MdMedicalServices,
  MdProductionQuantityLimits,
  MdOutlineStickyNote2,
  MdMedicalInformation,
} from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useCallback, useState } from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import { CheckPermissions } from "../../controllers/utils/check_permissions";

const Sidebar = () => {
  const { auth, logout } = useAuth();
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    Router.push("/");
  }, [logout]);

  const handleChanges = () => {
    setMostrarCarga(true);
    Router.push("/configuration");
    setTimeout(() => {
      setMostrarCarga(false);
    }, 10000);
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="p-6 w-1/2 h-screen bg-white z-20 fixed top-0 left-0 lg:w-1/6">
      <p className="text-center mb-4">
        Usuario: <strong>{auth?.nombre}</strong>
      </p>
      <div className="flex flex-col justify-start">
        <h1 className="text-center font-bold text-xl mb-2">Menu</h1>
        <a
          href="/"
          className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
            isActive("/") ? "bg-blue-500 text-white" : "text-gray-800"
          }`}
          onClick={handleChanges}
        >
          <MdOutlineSpaceDashboard className="text-2xl" />
          <span>Inicio</span>
        </a>
        <>
          <a
            href="/solicitudes"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/solicitudes")
                ? "bg-blue-500 text-white"
                : "text-gray-800"
            }`}
            onClick={handleChanges}
          >
            <MdStore className="text-2xl" />
            <span>Solicitudes</span>
          </a>
        </>
        {!CheckPermissions(auth, [2]) && (
          <a
            href="/bodegas"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/bodegas") ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
            onClick={handleChanges}
          >
            <MdProductionQuantityLimits className="text-2xl" />
            <span>Bodegas</span>
          </a>
        )}
        {!CheckPermissions(auth, [2]) && (
          <a
            href="/calibracion"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/configuration")
                ? "bg-blue-500 text-white"
                : "text-gray-800"
            }`}
            onClick={handleChanges}
          >
            <MdMedicalInformation className="text-2xl" />
            <span>Calibración</span>
          </a>
        )}
        {!CheckPermissions(auth, [1, 2]) && (
          <a
            href="/configuration"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/configuration")
                ? "bg-blue-500 text-white"
                : "text-gray-800"
            }`}
            onClick={handleChanges}
          >
            <MdOutlineSettings className="text-2xl" />
            <span>Administración</span>
          </a>
        )}
        {!CheckPermissions(auth, [1, 2]) && (
          <a
            href="/auditory"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/auditory") ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
            onClick={handleChanges}
          >
            <MdOutlineStickyNote2 className="text-2xl" />
            <span>AuditoriasC</span>
          </a>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-2 mt-4 rounded-lg hover:bg-blue-500 hover:text-white text-gray-800"
        >
          <MdOutlineLogout className="text-2xl" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
