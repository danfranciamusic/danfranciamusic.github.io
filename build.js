#!/usr/bin/env node
"use strict";

// Tiny zero-dependency static site builder.
//
// Stitches src/templates/layout.html together with each src/pages/*.html file and
// copies static assets into dist/, which is what actually gets deployed
// to GitHub Pages (see .github/workflows/deploy.yml). No client-side JS
// is involved in navigation -- these are plain links between plain pages.
//
// Usage: node build.js

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

const STATIC_ASSETS = [
  { src: "CNAME", dest: "CNAME" },
  { src: "favicon.ico", dest: "favicon.ico" },
  { src: path.join("assets", "styles.css"), dest: "styles.css" },
];

const pages = [
  { file: "home.html", out: "index.html", href: "/", title: "Dan Francia", nav: "home", label: "Home" },
  { file: "music.html", out: "music.html", title: "Music — Dan Francia", nav: "music", label: "Music" },
  { file: "gigs.html", out: "gigs.html", title: "Gigs — Dan Francia", nav: "gigs", label: "Gigs" },
  { file: "newsletter.html", out: "newsletter.html", title: "Newsletter — Dan Francia", nav: "newsletter", label: "Newsletter" },
];

function renderNav(activeNav) {
  return pages
    .map((p) => {
      const cls = p.nav === activeNav ? "tab active" : "tab";
      const href = p.href || p.out;
      return `        <a href="${href}" class="${cls}">${p.label}</a>`;
    })
    .join("\n");
}

// --- Releases: simple config files rendered through src/templates/release.html ---
//
// Config format (see templates/release-template.txt for a blank copy-paste
// starter): "key: value" lines, or "key:" on its own line followed by a
// fenced ``` block for multi-line values. Lines starting with # are comments.

function parseConfig(text) {
  const data = {};
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "" || line.trim().startsWith("#")) {
      i++;
      continue;
    }

    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!match) {
      i++;
      continue;
    }

    const [, key, inlineValue] = match;

    if (inlineValue.trim() !== "") {
      data[key] = inlineValue.trim();
      i++;
      continue;
    }

    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;

    if (j < lines.length && lines[j].trim() === "```") {
      const blockLines = [];
      j++;
      while (j < lines.length && lines[j].trim() !== "```") {
        blockLines.push(lines[j]);
        j++;
      }
      data[key] = blockLines.join("\n").trim();
      i = j + 1;
    } else {
      i++;
    }
  }

  return data;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTracklist(raw) {
  if (!raw) return "";
  const items = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]+\s*/, ""))
    .map((line) => `      <li>${escapeHtml(line)}</li>`)
    .join("\n");
  return `    <ol class="tracklist">\n${items}\n    </ol>`;
}

function renderCredits(raw) {
  if (!raw) return "";
  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => escapeHtml(l.trim()));
      return `      <p>\n        ${lines.join("<br>\n        ")}\n      </p>`;
    })
    .join("\n");
  return `    <div class="credits">\n${paragraphs}\n    </div>`;
}

function renderPlayer(src, link, title) {
  if (!src) return "";
  const fallback = link ? `<a href="${link}">${escapeHtml(title)} on Bandcamp</a>` : "";
  return `    <div class="release-video">
      <iframe style="border: 0; width: 100%; height: 120px;" src="${src}" seamless>${fallback}</iframe>
    </div>`;
}

function loadReleases() {
  const dir = path.join(SRC, "data", "releases");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".txt"))
    .map((f) => parseConfig(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderRelease(r) {
  return fs
    .readFileSync(path.join(SRC, "templates", "release.html"), "utf8")
    .replace("{{ARTWORK}}", r.artwork || "")
    .replace("{{ARTWORK_ALT}}", escapeHtml(r["artwork-alt"] || `${r.title} cover art`))
    .replace("{{TITLE}}", escapeHtml(r.title || ""))
    .replace("{{DATE}}", escapeHtml(r.date || ""))
    .replace("{{TRACKLIST}}", renderTracklist(r.tracklist))
    .replace("{{CREDITS}}", renderCredits(r.credits))
    .replace("{{PLAYER}}", renderPlayer(r.player, r["player-link"], r.title));
}

function renderReleases() {
  const releases = loadReleases();
  if (releases.length === 0) {
    return '<p class="empty">No releases listed yet — check back soon.</p>';
  }
  return releases.map(renderRelease).join("\n\n");
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const asset of STATIC_ASSETS) {
  const from = path.join(ROOT, asset.src);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(DIST, asset.dest));
  }
}

const layout = fs.readFileSync(path.join(SRC, "templates", "layout.html"), "utf8");

for (const page of pages) {
  const contentPath = path.join(SRC, "pages", page.file);
  let content = fs.readFileSync(contentPath, "utf8").trim();

  if (content.includes("{{RELEASES}}")) {
    content = content.replace("{{RELEASES}}", renderReleases());
  }

  const html = layout
    .replace("{{TITLE}}", page.title)
    .replace("{{NAV}}", renderNav(page.nav))
    .replace("{{CONTENT}}", content);

  fs.writeFileSync(path.join(DIST, page.out), html);
  console.log(`built dist/${page.out}`);
}
