import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { Conversation, ConversationContent } from "./elements/conversation.jsx";
import { Message, MessageContent, MessageResponse } from "./elements/message.jsx";
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from "./elements/prompt-input.jsx";

const KEY = "parspack-api-key";

export default function ChatPanel({ models, initialModel, onClose }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY) ?? "");
  const [model, setModel] = useState(initialModel);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({ Authorization: `Bearer ${localStorage.getItem(KEY) ?? ""}` }),
        body: () => ({ model }),
      }),
    [model],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  function saveKey(value) {
    setApiKey(value);
    localStorage.setItem(KEY, value.trim());
  }

  return (
    <section className="chat-panel" aria-label="Chat">
      <header className="chat-panel-bar">
        <strong>Chat</strong>
        <button type="button" className="chat-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </header>
      <label className="chat-field">
        ParsPack API key
        <input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(event) => saveKey(event.target.value)}
          placeholder="AI Studio key"
        />
      </label>
      <label className="chat-field">
        Model
        <select value={model} onChange={(event) => setModel(event.target.value)}>
          {models.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) =>
                  part.type === "text" ? <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse> : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {error ? <p className="chat-error">{error.message}</p> : null}
        </ConversationContent>
      </Conversation>
      <PromptInput
        onSubmit={(message) => {
          const text = message.text.trim();
          if (!text || !apiKey.trim()) return;
          sendMessage({ text });
          setInput("");
        }}
      >
        <PromptInputTextarea
          value={input}
          placeholder="Message"
          onChange={(event) => setInput(event.target.value)}
        />
        <PromptInputSubmit status={status} disabled={!input.trim() || !apiKey.trim()} />
      </PromptInput>
    </section>
  );
}
