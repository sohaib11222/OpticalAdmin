const { chromium } = require("playwright");

const url = process.argv[2];
const label = process.argv[3] || url;

(async () => {
  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage();
  const logs = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}\n${e.stack}`));
  page.on("requestfailed", (r) =>
    logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`),
  );

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch (e) {
    console.log(`${label}: navigation issue -> ${e.message.split("\n")[0]}`);
  }

  await page.waitForTimeout(3000);

  const report = await page.evaluate(() => {
    const splash = document.querySelector("#splash-screen");
    const root = document.querySelector("#root");
    const cs = splash ? getComputedStyle(splash) : null;
    return {
      title: document.title,
      rootChildren: root ? root.children.length : -1,
      rootHtmlLength: root ? root.innerHTML.length : -1,
      bodyText: (document.body.innerText || "").slice(0, 200),
      splashClasses: splash ? splash.className : null,
      splashOpacity: cs ? cs.opacity : null,
      splashVisibility: cs ? cs.visibility : null,
      splashDisplay: cs ? cs.display : null,
      splashZ: cs ? cs.zIndex : null,
      splashRect: splash ? JSON.stringify(splash.getBoundingClientRect()) : null,
      // What the user actually sees at the centre of the viewport.
      topElementAtCentre:
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.id ||
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.tagName ||
        null,
    };
  });

  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(report, null, 2));
  console.log("\n--- console / errors ---");
  console.log(logs.slice(0, 40).join("\n") || "(none)");

  await browser.close();
})();