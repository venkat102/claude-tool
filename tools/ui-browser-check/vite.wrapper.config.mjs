// The tree's own dev config, with the bench-config import pointed at a stand-in file: a git
// worktree (or any checkout outside a bench) has no sites/common_site_config.json, and
// src/socket.js imports it by a fixed relative path. Copied into frontend/ by run.sh for one run.
import { mergeConfig } from "vite";
import base from "./vite.config.js";

const resolved =
	typeof base === "function" ? await base({ command: "serve", mode: "development" }) : base;
export default mergeConfig(resolved, {
	resolve: {
		alias: {
			"../../../../sites/common_site_config.json": process.env.UI_CHECK_SITE_CONFIG,
		},
	},
});
