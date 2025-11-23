import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)] justify-center items-start pt-4 sm:pt-8 md:pt-12">
            <div className="w-full max-w-3xl h-full">
                <ChatInterface />
            </div>
        </div>
    );
}
