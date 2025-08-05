import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../controllers/hooks/use_auth";

export default function DashboardIndex() {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth === null) return; // aún no sabemos el rol
    const path =
      auth?.rol === 0 ? "/dashboard/admin" :
      auth?.rol === 1 ? "/dashboard/bodeguero" :
      auth?.rol === 2 ? "/dashboard/cliente" :
      "/login";

    // replace evita ensuciar el historial (mejor para back button)
    router.replace(path);
  }, [auth, router]);

  return (
    <>
      <Head>
        <title>Redireccionando…</title>
        <meta name="description" content="Redireccionamiento automático al panel correspondiente." />
      </Head>

      {/* Región viva para lectores de pantalla */}
      <div className="flex items-center justify-center h-screen" aria-live="polite">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redireccionando…</h1>
          <p className="mt-4">Por favor, espere mientras lo llevamos a su panel.</p>

          {/* Fallback accesible si JS está desactivado */}
          <noscript>
            <p>La redirección automática requiere JavaScript. Use el siguiente enlace:</p>
            <a href="/login">Ir al inicio de sesión</a>
          </noscript>
        </div>
      </div>
    </>
  );
}
