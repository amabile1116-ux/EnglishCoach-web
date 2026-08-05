import "../styles/globals.css";
import React from "react";
import MainLayout from "@/components/MainLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
