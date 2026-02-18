import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Chat />
    </div>
  );
}
