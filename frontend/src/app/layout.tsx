import "./globals.css";
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";

export const metadata = {
  title: "Datagent | Rudra Jadon",
  description:
    "Multimodal data analysis and preparation powered by Gemini 1.5 Pro",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
