/* The worksheet uses elapsed durations. The workbench reads only its three fixed fixtures. */
(() => {
  "use strict";

  function parseInteger(value, label, maximum) {
    const raw = String(value).trim();
    const amount = Number(raw);
    if (!raw || !Number.isSafeInteger(amount) || amount < 0 || amount > maximum) {
      throw new RangeError(label + " must be a whole number between 0 and " + maximum.toLocaleString("en-US") + ".");
    }
    return amount;
  }

  function calculateWindow(previousInput, reducedInput, leadInput) {
    const previous = parseInteger(previousInput, "Previous TTL", 2147483647);
    const reduced = parseInteger(reducedInput, "Reduced TTL", 2147483647);
    const leadMinutes = parseInteger(leadInput, "Lead time in minutes", 35791395);
    if (reduced > previous) {
      throw new RangeError("The reduced TTL must be less than or equal to the previous TTL.");
    }
    const remaining = Math.max(0, previous - leadMinutes * 60);
    // With no lead, the old address was never served with the shorter TTL.
    const shortWindow = leadMinutes > 0 ? reduced : 0;
    return {remaining, shortWindow, overlap: Math.max(remaining, shortWindow)};
  }

  function duration(seconds) {
    if (seconds === 0) return "0 seconds";
    const units = [[86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"]];
    const parts = [];
    for (const [length, name] of units) {
      const n = Math.floor(seconds / length);
      if (n > 0) parts.push(n + " " + name + (n === 1 ? "" : "s"));
      seconds %= length;
    }
    return parts.join(" ");
  }

  const specimens = [
    {name: "Stylesheet", path: "/assets/evidence/field.css"},
    {name: "HTML stand-in", path: "/assets/evidence/fallback.html"},
    {name: "Missing stylesheet", path: "/assets/evidence/not-published.css"}
  ];

  function interpret(status, type, sample) {
    if (status === 404) return "The host reports a missing resource. Check the requested path and the deployed file tree.";
    if (status < 200 || status >= 300) return "This status needs investigation before the body can be used as a stylesheet.";
    if (!sample.trim()) return "The response body is empty. No stylesheet rules were received.";
    if (type === "text/html" || /^\s*(?:<!doctype\s+html|<html\b)/i.test(sample)) {
      return "An HTML document arrived where CSS was expected. Inspect the asset URL and any fallback rule.";
    }
    if (type === "text/css") return "The declared response type matches a stylesheet. Inspect the rules to confirm the expected revision.";
    return "The response does not declare text/css. Check the host’s media-type mapping and the body.";
  }

  function setupWorksheet(form) {
    const output = document.getElementById("ttl-result");
    const status = document.getElementById("ttl-status");
    function changed() {
      output.hidden = true;
      status.textContent = "Values changed. Calculate again to update the result.";
    }
    form.addEventListener("input", changed);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      output.hidden = true;
      try {
        const values = calculateWindow(form.elements.previous.value, form.elements.reduced.value, form.elements.lead.value);
        document.getElementById("window-old").textContent = duration(values.remaining);
        document.getElementById("window-new").textContent = duration(values.shortWindow);
        document.getElementById("window-total").textContent = duration(values.overlap);
        output.hidden = false;
        status.textContent = "Calculated planning window after cutover: " + duration(values.overlap) + ".";
      } catch (error) {
        status.textContent = error.message;
      }
    });
  }

  function addLine(list, label, value) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    list.append(term, description);
  }

  function setupWorkbench(button) {
    const output = document.getElementById("response-results");
    const statusLine = document.getElementById("response-status");
    button.addEventListener("click", async () => {
      button.disabled = true;
      output.replaceChildren();
      statusLine.textContent = "Requesting three samples from this website…";
      try {
        for (const specimen of specimens) {
          const card = document.createElement("section");
          card.className = "response-card";
          const title = document.createElement("h3");
          title.textContent = specimen.name;
          const list = document.createElement("dl");
          card.append(title, list);
          addLine(list, "Requested path", specimen.path);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 7000);
          try {
            const response = await fetch(specimen.path, {
              cache: "no-store", credentials: "omit", signal: controller.signal,
              headers: {Accept: "text/css, */*;q=0.1"}
            });
            const body = (await response.text()).trim();
            const contentType = (response.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
            addLine(list, "HTTP status", String(response.status));
            addLine(list, "Media type", contentType || "No Content-Type supplied");
            addLine(list, "Body starts with", body.slice(0, 80) || "(empty body)");
            addLine(list, "Interpretation", interpret(response.status, contentType, body));
          } catch (error) {
            addLine(list, "Request result", error.name === "AbortError" ? "Timed out after seven seconds." : "The browser could not read this response. Check connectivity and retry.");
          } finally {
            clearTimeout(timeout);
          }
          output.append(card);
        }
        statusLine.textContent = "Three requests finished. Compare the status, media type and body below.";
      } finally {
        button.disabled = false;
      }
    });
  }

  if (typeof module === "object" && module.exports) {
    module.exports = {calculateWindow, duration, interpret};
  }
  if (typeof document === "undefined") return;
  const worksheet = document.getElementById("ttl-form");
  if (worksheet) setupWorksheet(worksheet);
  const run = document.getElementById("request-samples");
  if (run) setupWorkbench(run);
})();
