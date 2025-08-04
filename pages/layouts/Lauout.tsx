// layouts/Layout.tsx
import Head from "next/head";

export default function Layout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{title} - CEMAE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </Head>
      <main>{children}</main>
    </>
  );
}
