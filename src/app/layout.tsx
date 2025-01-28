"use client";

import { Modal } from "@/components/organisms";
import AppContext from "@/contexts";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body id="body">
        <SessionProvider>
          <Suspense>
            <AppContext>
              <Toaster richColors />
              <Modal />
              {children}
            </AppContext>
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
