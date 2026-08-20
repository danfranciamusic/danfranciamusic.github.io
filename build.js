#!/usr/bin/env node
"use strict";

// Tiny zero-dependency static site builder.
//
// Stitches src/layout.html together with each src/pages/*.html file to
// produce the real, static HTML files GitHub Pages serves (index.html,
// music.html, gigs.html, newsletter.html). No client-side JS is involved
// in navigation -- these are plain links between plain pages.
//
// Usage: node build.js

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");

const layout = fs.readFileSync(path.join(SRC, "layout.html"), "utf8");

const pages = [
  { file: "home.html", out: "index.html", title: "Dan Francia", nav: "home", label: "Home" },
  { file: "music.html", out: "music.html", title: "Music — Dan Francia", nav: "music", label: "Music" },
  { file: "gigs.html", out: "gigs.html", title: "Gigs — Dan Francia", nav: "gigs", label: "Gigs" },
  { file: "newsletter.html", out: "newsletter.html", title: "Newsletter — Dan Francia", nav: "newsletter", label: "Newsletter" },
];

function renderNav(activeNav) {
  return pages
    .map((p) => {
      const cls = p.nav === activeNav ? "tab active" : "tab";
      return `        <a href="${p.out}" class="${cls}">${p.label}</a>`;
    })
    .join("\n");
}

for (const page of pages) {
  const contentPath = path.join(SRC, "pages", page.file);
  const content = fs.readFileSync(contentPath, "utf8").trim();

  const html = layout
    .replace("{{TITLE}}", page.title)
    .replace("{{NAV}}", renderNav(page.nav))
    .replace("{{CONTENT}}", content);

  fs.writeFileSync(path.join(ROOT, page.out), html);
  console.log(`built ${page.out}`);
}
