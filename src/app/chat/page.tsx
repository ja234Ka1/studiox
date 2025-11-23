import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <ChatInterface />
        </div>
    );
}
