import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#1A1A1A] border border-[#2A2A2A]",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            formFieldInput: "bg-[#2A2A2A] border-[#3A3A3A] text-white",
            formFieldLabel: "text-gray-300",
            footerActionLink: "text-blue-400 hover:text-blue-300",
          },
        }}
      />
    </div>
  );
}
