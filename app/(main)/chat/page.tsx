import { getSession } from "@/lib/auth";
import ChatClient from "./chat-client";

export default async function ChatPage() {
  const session = await getSession();
  return <ChatClient userId={session!.id} />;
}