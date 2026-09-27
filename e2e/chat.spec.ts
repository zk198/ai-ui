import { test, expect } from "@playwright/test";

test("streams grounded chat and renders citations", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("rag-ui.jwt", "test-token"));

  await page.route("**/api/v1/answer/stream", async route => {
    const body =
      'event: delta\ndata: {"content":"Hello "}\n\n' +
      'event: delta\ndata: {"content":"world"}\n\n' +
      'event: done\ndata: {"conversation_id":"c1","citations":[{"id":"S1","chunk_id":"chunk-1","source_name":"mailbox","text":"Evidence"}]}\n\n';

    await route.fulfill({
      status: 200,
      headers: {"Content-Type": "text/event-stream", "Cache-Control": "no-cache"},
      body,
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", {name: "Ask your knowledge base"})).toBeVisible();
  await page.getByLabel("Chat message").fill("What is important?");
  await page.getByRole("button", {name: "Send"}).click();

  await expect(page.getByText("Hello world")).toBeVisible();
  await expect(page.getByText("[S1] mailbox")).toBeVisible();
  await expect(page.getByText("Evidence")).toBeVisible();
});
