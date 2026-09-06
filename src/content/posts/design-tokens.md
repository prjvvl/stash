---
title: "Why Trestle uses design tokens"
description: "Colors, spacing, and type scale live in one place so a site stays visually consistent as it grows."
date: 2026-08-20
tags: ["design", "meta"]
---

Every component in Trestle reads from a small set of CSS variables — brand
color, background, border, text — instead of hardcoding values. Change a
color once in `src/styles/global.css` and the whole site updates.
