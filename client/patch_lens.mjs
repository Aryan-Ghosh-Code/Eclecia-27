import * as fs from "fs";

const file = "components/events/atlas/engine.ts";
let content = fs.readFileSync(file, "utf8");

const target = `    if (lens) {
      lens.className = "atlas-lens";
      lens.setAttribute("aria-hidden", "true");
      lens.style.transformOrigin = \`\${x}px \${y}px\`;
      const standIn = focusedWorld.cloneNode(true) as HTMLElement;
      standIn.removeAttribute("aria-label");
      standIn.tabIndex = -1;
      lens.append(standIn);
      overview.append(lens);
    }`;

const replacement = `    if (lens) {
      lens.className = "atlas-lens";
      lens.setAttribute("aria-hidden", "true");
      lens.style.transformOrigin = \`\${x}px \${y}px\`;
      const standIn = focusedWorld.cloneNode(true) as HTMLElement;
      standIn.removeAttribute("aria-label");
      standIn.tabIndex = -1;
      standIn.style.zIndex = "99";
      lens.append(standIn);
      root.append(lens);
    }`;

const normalized = content.replace(/\r\n/g, "\n");
const normTarget = target.replace(/\r\n/g, "\n");

if (normalized.includes(normTarget)) {
  const updated = normalized.replace(normTarget, replacement);
  fs.writeFileSync(file, updated.replace(/\n/g, "\r\n"), "utf8");
  console.log("Updated engine.ts standIn root.append");
} else {
  console.log("Target not found");
}
