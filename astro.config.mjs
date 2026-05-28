import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server", // Enables hybrid/server SSR rendering on Cloudflare Edge Workers
	adapter: cloudflare({
		imageService: "none", // Cloudflare doesn't support local sharp image service out of the box
	}),
	integrations: [react()],
	vite: {
		plugins: [tailwindcss()],
	},
});
