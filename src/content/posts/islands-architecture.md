---
title: "Islands, not a single-page app"
description: "Why most of a Trestle site ships zero JavaScript, and how React fits in only where you actually need it."
date: 2026-08-25
tags: ["astro", "react"]
---

A Trestle page is plain HTML by default. When a page needs real
interactivity — a filter, a live counter, a form with client-side
validation — you drop in a React component and mark it as an island. Only
that component's JavaScript reaches the browser; everything else on the
page stays static.
