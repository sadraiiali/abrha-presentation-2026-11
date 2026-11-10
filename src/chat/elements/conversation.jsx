import { StickToBottom } from "use-stick-to-bottom";

export function Conversation({ children }) {
  return (
    <StickToBottom className="chat-conversation" initial="smooth" resize="smooth" role="log">
      {children}
    </StickToBottom>
  );
}

export function ConversationContent({ children }) {
  return <StickToBottom.Content className="chat-conversation-content">{children}</StickToBottom.Content>;
}
