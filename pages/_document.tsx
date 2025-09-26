import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="es">
        <Head />
        <body>
          <Main />
          <NextScript />
          <noscript>
            <div
              style={{
                backgroundColor: "#fff",
                color: "#000",
                padding: "1rem",
                fontFamily: "sans-serif",
              }}
            >
              <p>
                JavaScript está deshabilitado en tu navegador. Algunas funciones
                de esta página pueden no estar disponibles.
              </p>
              <p>
                <a href="/version-accesible">
                  Haz clic aquí para acceder a una versión alternativa.
                </a>
              </p>
              <footer
                style={{
                  marginTop: "2rem",
                  borderTop: "1px solid #ccc",
                  paddingTop: "1rem",
                  textAlign: "center",
                  fontSize: "0.95rem",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                &copy; 2025 — Reservado: Sistema Web elaborado por Ing. Quizhpi Marco
              </footer>
            </div>
          </noscript>
          {/* Footer reservado, siempre fijo abajo */}
          <footer
            style={{
              position: "fixed",
              left: 0,
              bottom: 0,
              width: "100vw",
              backgroundColor: "#f3f4f6", // fondo sólido (gris claro)
              borderTop: "1px solid #d1d5db",
              textAlign: "center",
              fontSize: "0.95rem",
              color: "#111", // texto oscuro, mejor contraste
              padding: "0.8rem 0",
              zIndex: 1000,
              fontStyle: "italic",
              letterSpacing: "0.05em",
              userSelect: "none",
            }}
            aria-label="Pie de página reservado"
          >
            &copy; {new Date().getFullYear()} — Reservado: Sistema Web de inventarios CEMAE : Elaborado por Ing. Quizhpi Marco Antonio
          </footer>

        </body>
      </Html>
    );
  }
}
