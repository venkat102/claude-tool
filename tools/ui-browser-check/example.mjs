// Template for a real-Chrome check of one screen of the Jarvis SPA. Copy it, change the route,
// the mocked answers and the steps. Run it with:  sh run.sh <tree>/frontend <this file>
//
// It drives the page with the `playwright` LIBRARY (resolved from frontend/node_modules) and the
// machine's installed Google Chrome. The Playwright TEST RUNNER hangs in a git worktree, so do
// not use `npx playwright test` there.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:8117";
const SHOTS = process.env.SHOTS || ""; // a folder to save screenshots in, or empty for none

let failed = 0;
const step = (name, ok, detail = "") => {
	if (!ok) failed += 1;
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
};

// One page, signed in as `user`, with the Frappe API answered here (no bench needed).
// `answer(method)` returns the `message` for a whitelisted method path, or undefined for the
// defaults below. `flags` are the page boot flags (window.is_jarvis_admin, ...).
async function open(browser, path, { viewport = { width: 1280, height: 760 }, user = "admin@example.test", flags = {}, answer = () => undefined } = {}) {
	const context = await browser.newContext({ viewport });
	await context.addCookies([{ name: "user_id", value: encodeURIComponent(user), url: BASE }]);
	const page = await context.newPage();
	const calls = [];
	const errors = [];
	page.on("pageerror", (e) => errors.push(String(e)));
	await page.addInitScript((f) => {
		Object.assign(window, {
			csrf_token: "test",
			time_zone: "Asia/Kolkata",
			agent_name: "Jarvis",
			is_system_manager: false,
			is_jarvis_admin: false,
			support_available: false,
			has_support_access: false,
			release_notice: "",
			...f,
		});
	}, flags);
	await page.route("**/api/method/**", async (route) => {
		const method = new URL(route.request().url()).pathname.split("/api/method/")[1];
		calls.push(method.split(".").pop());
		let message = answer(method, route.request());
		if (message === undefined) {
			if (method.endsWith("is_ready_for_chat")) message = { ready: true };
			else if (method.includes("count")) message = 0;
			else if (method.includes("list")) message = [];
			else message = {};
		}
		await route.fulfill({ json: { message } });
	});
	// `?nosocket` keeps the page from trying to reach socket.io.
	await page.goto(`${BASE}${path}${path.includes("?") ? "&" : "?"}nosocket`);
	return { page, context, calls, errors };
}

// What has keyboard focus, and whether it is inside a dialog.
const active = (page) =>
	page.evaluate(() => {
		const el = document.activeElement;
		return {
			tag: el.tagName,
			text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
			inDialog: !!el.closest('[role="dialog"], [role="alertdialog"]'),
		};
	});

// Sideways overflow, measured where it can hide: the document, AND every scroll area on the page
// (an overflow inside a scroll area never shows in the document's width).
const overflow = (page) =>
	page.evaluate(() => {
		const wide = [...document.querySelectorAll("*")]
			.filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "visible")
			.map((el) => `${el.tagName}.${String(el.className).split(" ")[0]} ${el.scrollWidth}>${el.clientWidth}`);
		return { doc: document.documentElement.scrollWidth, view: window.innerWidth, scrollers: wide.slice(0, 5) };
	});

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
	// ── 1. the screen renders, at desktop, laptop and phone widths ──────────────
	for (const [label, viewport] of [
		["desktop", { width: 1440, height: 820 }],
		["laptop", { width: 1100, height: 720 }],
		["phone", { width: 375, height: 667 }],
		["small-phone", { width: 320, height: 568 }],
	]) {
		const s = await open(browser, "/jarvis/skills", { viewport });
		await s.page.waitForTimeout(1500);
		const o = await overflow(s.page);
		step(`${label}: the page does not scroll sideways`, o.doc <= o.view, JSON.stringify(o));
		step(`${label}: no page errors`, s.errors.length === 0, s.errors.slice(0, 2).join(" | ").slice(0, 200));
		if (SHOTS) await s.page.screenshot({ path: `${SHOTS}/${label}.png` });
		await s.context.close();
	}

	// ── 2. the keyboard: reach every control, open and close what opens ─────────
	// const s = await open(browser, "/jarvis/...");
	// await s.page.locator("...").focus();
	// await s.page.keyboard.press("Tab");            // real key presses, never .focus() on the target
	// step("Tab reaches ...", (await active(s.page)).text === "...");
	// await s.page.keyboard.press("Enter");
	// step("the dialog takes focus", (await active(s.page)).inDialog);
	// await s.page.keyboard.press("Escape");
	// step("focus returns to what opened it", (await active(s.page)).text === "...");

	// ── 3. names for assistive tech ─────────────────────────────────────────────
	// step("the icon button is named", (await s.page.getByRole("button", { name: "Refresh", exact: true }).count()) === 1);
} finally {
	await browser.close();
}
console.log(`RESULT ${failed ? "FAILED" : "all passed"}`);
process.exit(failed ? 1 : 0);
