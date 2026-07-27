import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://ellenbraga.com"),
  title: "Ellen Braga — Creative Director & IA Generativa",
  description:
    "Ellen Braga — Creative Director especializada em IA generativa. Visuais audaciosos onde não dá pra saber o que é real e o que é IA.",
  openGraph: {
    title: "Ellen Braga — Creative Director & IA Generativa",
    description: "Conceitual radical. Execução perfeita. Pronto pra ir ao ar.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#050403",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
