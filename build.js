#!/usr/bin/env node
"use strict";

// Tiny static site builder.
//
// Stitches src/templates/layout.html together with each src/pages/*.html file
// (release/post data comes from src/data/*.toml, parsed with smol-toml) and
// copies everything in public/ as-is into dist/, which is what actually gets
// deployed to GitHub Pages (see .github/workflows/deploy.yml). No client-side
// JS is involved in navigation -- these are plain links between plain pages.
//
// Usage: node build.js

const fs = require("fs");
const path = require("path");
const { parse: parseToml } = require("smol-toml");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

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

// --- Releases: src/data/releases.toml, rendered through src/templates/release.html ---
//
// [[release]] is an array of release records. Order in the file doesn't
// matter -- they're sorted by "date" below. A malformed TOML file fails
// the build loudly (with a line number) rather than silently producing
// wrong output.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTracklist(tracks) {
  if (!tracks || tracks.length === 0) return "";
  const items = tracks.map((line) => `      <li>${escapeHtml(line)}</li>`).join("\n");
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
  const file = path.join(SRC, "data", "releases.toml");
  if (!fs.existsSync(file)) return [];

  const { release } = parseToml(fs.readFileSync(file, "utf8"));
  return [...(release || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderRelease(r) {
  return fs
    .readFileSync(path.join(SRC, "templates", "release.html"), "utf8")
    .replace("{{ARTWORK}}", r.artwork || "")
    .replace("{{ARTWORK_ALT}}", escapeHtml(r.artwork_alt || `${r.title} cover art`))
    .replace("{{TITLE}}", escapeHtml(r.title || ""))
    .replace("{{DATE}}", escapeHtml(r.date || ""))
    .replace("{{TRACKLIST}}", renderTracklist(r.tracklist))
    .replace("{{CREDITS}}", renderCredits(r.credits))
    .replace("{{PLAYER}}", renderPlayer(r.player, r.player_link, r.title));
}

function renderReleases() {
  const releases = loadReleases();
  if (releases.length === 0) {
    return '<p class="empty">No releases listed yet — check back soon.</p>';
  }
  return releases.map(renderRelease).join("\n\n");
}

// --- Posts: src/data/posts.toml, rendered through src/templates/post.html ---
//
// [[post]] is an array of post records, listed oldest to newest (append
// new ones to the end) and reversed below for newest-first display. Posts
// have no titles -- just an optional text block, link, image (with
// optional caption), and/or video, rendered in that fixed order.

function renderPostText(raw) {
  if (!raw) return "";
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => escapeHtml(l.trim()));
      return `    <p>${lines.join("<br>\n    ")}</p>`;
    })
    .join("\n");
}

function renderPostLink(link) {
  if (!link) return "";
  return `    <p><a href="${link}">${escapeHtml(link)}</a></p>`;
}

function youTubeEmbedUrl(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function renderPostVideo(url) {
  if (!url) return "";
  return `    <div class="post-video">
      <iframe src="${youTubeEmbedUrl(url)}" title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>`;
}

function renderPostImage(src, alt, caption) {
  if (!src) return "";
  const img = `    <img class="post-image" src="${src}" alt="${escapeHtml(alt || "")}">`;
  const cap = caption ? `\n    <p class="post-caption">${escapeHtml(caption)}</p>` : "";
  return img + cap;
}

function loadPosts() {
  const file = path.join(SRC, "data", "posts.toml");
  if (!fs.existsSync(file)) return [];

  const { post } = parseToml(fs.readFileSync(file, "utf8"));
  return [...(post || [])].reverse();
}

function renderPost(p) {
  return fs
    .readFileSync(path.join(SRC, "templates", "post.html"), "utf8")
    .replace("{{TEXT}}", renderPostText(p.text))
    .replace("{{LINK}}", renderPostLink(p.link))
    .replace("{{IMAGE}}", renderPostImage(p.image, p.image_alt, p.caption))
    .replace("{{VIDEO}}", renderPostVideo(p.video));
}

function renderPosts() {
  return loadPosts().map(renderPost).join("\n\n");
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

if (fs.existsSync(PUBLIC)) {
  copyDir(PUBLIC, DIST);
}

const layout = fs.readFileSync(path.join(SRC, "templates", "layout.html"), "utf8");

for (const page of pages) {
  const contentPath = path.join(SRC, "pages", page.file);
  let content = fs.readFileSync(contentPath, "utf8").trim();

  if (content.includes("{{RELEASES}}")) {
    content = content.replace("{{RELEASES}}", renderReleases());
  }

  if (content.includes("{{POSTS}}")) {
    content = content.replace("{{POSTS}}", renderPosts());
  }

  const html = layout
    .replace("{{TITLE}}", page.title)
    .replace("{{NAV}}", renderNav(page.nav))
    .replace("{{CONTENT}}", content);

  fs.writeFileSync(path.join(DIST, page.out), html);
  console.log(`built dist/${page.out}`);
}
