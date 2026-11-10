import { createElement } from "react";
import { createRoot } from "react-dom/client";
import ChatPanel from "./ChatPanel.jsx";

export function mountChat(target, props) {
  const root = createRoot(target);
  root.render(createElement(ChatPanel, props));
  return root;
}
