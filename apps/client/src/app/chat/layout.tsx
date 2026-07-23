import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
