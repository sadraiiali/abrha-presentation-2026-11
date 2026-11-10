import { memo } from "react";
import { Streamdown } from "streamdown";

export function Message({ from, children }) {
  return <div className={from === "user" ? "chat-message is-user" : "chat-message is-assistant"}>{children}</div>;
}

export function MessageContent({ children }) {
  return <div className="chat-message-content">{children}</div>;
}

export const MessageResponse = memo(function MessageResponse({ children }) {
  return <Streamdown>{children}</Streamdown>;
});
