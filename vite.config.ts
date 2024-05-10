import { defineConfig } from "vite";
//@ts-ignore
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
});
