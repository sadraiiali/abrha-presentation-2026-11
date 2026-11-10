export function PromptInput({ onSubmit, children }) {
  return (
    <form
      className="chat-prompt"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit({ text: String(data.get("message") ?? "") });
      }}
    >
      {children}
    </form>
  );
}

export function PromptInputTextarea({ value, onChange, placeholder }) {
  return (
    <textarea
      name="message"
      className="chat-prompt-text"
      value={value}
      placeholder={placeholder}
      rows={3}
      onChange={onChange}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}

export function PromptInputSubmit({ status, disabled }) {
  const streaming = status === "streaming" || status === "submitted";
  return (
    <button type="submit" className="chat-prompt-submit" disabled={disabled || streaming}>
      {streaming ? "…" : "Send"}
    </button>
  );
}
