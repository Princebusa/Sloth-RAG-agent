import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            Sloth RAG
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Use Google to connect your account and grant read-only Drive access
            for ingestion.
          </p>
        </div>
        <GoogleSignInButton />
      </div>
    </main>
  );
}
