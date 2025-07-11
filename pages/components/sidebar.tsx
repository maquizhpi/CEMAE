/* eslint-disable @next/next/no-html-link-for-pages */
import {
  MdOutlineSpaceDashboard,
  MdOutlineSettings,
  MdOutlineLogout,
  MdStore,
  MdProductionQuantityLimits,
  MdOutlineStickyNote2,
  MdMedicalInformation,
  MdBuild,
  MdOutlineLocationCity,
  MdCollections,
} from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useCallback, useState } from "react";
import Router, { useRouter } from "next/router";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import Image from "next/image";


const Sidebar = () => {
  const { auth, logout } = useAuth();
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false); 
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    Router.push("/");
  }, [logout]);

  const handleChanges = (path: string) => {
    setMostrarCarga(true);
    Router.push(path);
    setTimeout(() => {
      setMostrarCarga(false);
    }, 10000);
    setMenuAbierto(false); // Cierra el menú en móvil después de hacer clic
    setMenuAbierto(false); 
  };

  const isActive = (path: string) => router.pathname === path;
  
  return (
    <>
      {/* Botón de menú hamburguesa en móviles */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 bg-blue-500 text-white p-2 rounded-md"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <GiHamburgerMenu className="text-2xl" />
      </button>

      {/* Sidebar */}
      <div
        className={`p-6 w-1/2 h-screen bg-white z-20 fixed top-0 left-0 transition-transform duration-300 lg:w-1/6
          ${menuAbierto ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:block`}
      >
        {/* Botón para cerrar el menú en móvil */}
        <button
          className="lg:hidden absolute top-4 right-4 text-gray-700 text-2xl"
          onClick={() => setMenuAbierto(false)}
        >
          ×
        </button>
        {/* Imagen del logo */}
        <Image src="/image/logo2.jpeg" alt="Logo" width={100} height={100} />
        {/* Nombre del usuario */}
        <p className="text-center mb-4">
          <strong>{auth?.nombre}</strong>
        </p>


        {/* Menú */}
        <div className="flex flex-col justify-start">
          <h1 className="text-center font-bold text-xl mb-2">Menu</h1>
          <a
            href="/"
            className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
              isActive("/") ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
            onClick={e => { e.preventDefault(); handleChanges("/"); }}
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
              onClick={e => { e.preventDefault(); handleChanges("/solicitudes"); }}
            >
              <MdStore className="text-2xl" />
              <span>Solicitudes</span>
            </a>
          </>

          {!CheckPermissions(auth, [, 2]) && (
            <a
              href="/herramientas"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/herramientas") ? "bg-blue-500 text-white" : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/herramientas"); }}
            >
              <MdBuild className="text-2xl" />
              <span>Herramientas</span>
            </a>
          )}

          {!CheckPermissions(auth, [2]) && (
            <a
              href="/bodegas"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/bodegas") ? "bg-blue-500 text-white" : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/bodegas"); }}
            >
              <MdProductionQuantityLimits className="text-2xl" />
              <span>Bodegas</span>
            </a>

          )}{!CheckPermissions(auth, [2]) && (
            <a
              href="/ubicaciones"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/ubicaciones") ? "bg-blue-500 text-white" : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/ubicaciones"); }}
            >
              <MdOutlineLocationCity className="text-2xl" />
              <span>Ubicaciones</span>
            </a>
          )}

          {!CheckPermissions(auth, [2]) && (
            <a
              href="/calibracion"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/calibracion")
                  ? "bg-blue-500 text-white"
                  : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/calibracion"); }}
            >
              <MdMedicalInformation className="text-2xl" />
              <span>Calibración</span>
            </a>
          )}
          {!CheckPermissions(auth, [1,2]) && (
            <a
              href="/configuration"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/configuration")
                  ? "bg-blue-500 text-white"
                  : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/configuration"); }}
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
              onClick={e => { e.preventDefault(); handleChanges("/auditorias"); }}
            >
              <MdOutlineStickyNote2 className="text-2xl" />
              <span>Auditorias</span>
            </a>
          )}
          
          {!CheckPermissions(auth, [1,0]) && (
            <a
              href="/herramientas/catalogo"
              className={`flex items-center gap-4 mb-2 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white ${
                isActive("/herramientas/catalogo") ? "bg-blue-500 text-white" : "text-gray-800"
              }`}
              onClick={e => { e.preventDefault(); handleChanges("/herramientas/catalogo"); }}
            >
              <MdCollections className="text-2xl" />
              <span>Herramientas</span>
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

      {menuAbierto && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-10 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

