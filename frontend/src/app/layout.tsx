import "./globals.css";
import { ReactNode } from "react";
import { ClerkProvider, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Providers } from "./providers";

export const metadata = {
  title: "Datagent | Gemini Data Forge",
  description:
    "Multimodal data analysis and preparation powered by Gemini 1.5 Pro",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>
            <SignedIn>{children}</SignedIn>
            <SignedOut>
              <div className="flex items-center justify-center min-h-screen">
                <SignIn routing="hash" />
              </div>
            </SignedOut>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
