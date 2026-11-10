import { createElement } from "react";
import { createRoot } from "react-dom/client";
import LightTunnel from "./LightTunnel.jsx";

export function mountTunnel(target) {
  const root = createRoot(target);
  root.render(createElement(LightTunnel, { lightMode: false }));
  return root;
}
