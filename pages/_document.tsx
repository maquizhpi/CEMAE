import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

// Rehidrata los estilos para styled-components
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
            </div>
          </noscript>
        </body>
      </Html>
    );
  }
}
