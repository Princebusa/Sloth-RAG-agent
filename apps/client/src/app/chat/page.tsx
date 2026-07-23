import { ChatComposer } from "@/components/chat/chat-composer";

export default function ChatHomePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mb-10 max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            What do you want to know?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask a question about your Google Drive files. Your chat will get a
            unique ID you can reopen anytime.
          </p>
        </div>
      </div>

      <ChatComposer mode="new" />
    </div>
  );
}
