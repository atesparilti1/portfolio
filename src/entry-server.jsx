import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

// Build-time render: puts the real text of the page into index.html, so search
// engines, link previews and tools that do not run JavaScript can read it.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
