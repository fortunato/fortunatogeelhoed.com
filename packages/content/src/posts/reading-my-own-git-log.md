---
title: Reading My Own Git Log
slug: reading-my-own-git-log
type: post
date: 2026-07-02
tag: Build
description: I drove Claude Code through all 209 commits of this site and typed almost none of it by hand. Then I read every commit and sorted it, to see what the AI actually built and what I still had to know.
draft: false
---

The claim going around at the moment is that AI can build the whole app now. I have been
using Claude Code enough to have an opinion, but an opinion is cheap. I had a better option
sitting in front of me: this site. I built it over sixteen days, 209 commits between 31 May
and 15 June 2026, and I typed almost none of it by hand. The agent wrote the code. So rather
than argue about what these tools can do, I went and read what one of them actually did on a
real project, commit by commit.

## What I did

I read all 209 commits and sorted every one by what it was for. Not roughly, one at a time,
into thirteen categories, then grouped those into three tiers: the stuff you can see, the
stuff that makes it feel finished, and the stuff that keeps it standing once it is on the
internet. Line counts are churn, additions plus deletions, lockfiles excluded. Commit totals
and dates are exact. The category attribution is mine and approximate, because a single commit
often touches more than one thing, but the proportions hold up if you re-sort it a different
way.

## What I found

About 46% of the code is the visible surface: the components, the layout, the content. The
pages that exist and look right. That is the part most people mean when they say "build the
site", and it is the part these tools are good at.

The other 54% is work a visitor never sees. Tests and the CI that runs them. Infrastructure.
Security headers and rate limiting. Observability. Accessibility. And, because this site
renders in React, Vue and Angular to make a point, the same screens built three times to keep
the three in sync.

That is the number I keep coming back to. More than half the codebase is not the thing you
look at.

The point is not that the model cannot code. It obviously can. It wrote almost all of it. The point
is that a weekend build from the same tool has none of that second half. The model does not
reach for the rate limit or the tests on its own. It did here because I knew those had to be
there and told the agents to build them, in roughly the order they needed building, and I
could tell when an answer was confidently wrong. Same tool, different operator.

## Two things I want to be honest about

First, a portfolio is the kindest possible case for "AI can build the app". It has almost no
data, no users, no money, and hardly any domain logic that can break. The pages more or less
are the product. A real application puts a lot of unforgiving logic underneath the surface,
and that is exactly where a generated draft gets worse fastest. So this measurement is the
generous reading, not the harsh one.

Second, there is one part of the frontend the model still does not do well: the craft that
makes an interface feel composed rather than just present. The spacing that holds from the
top of the page to the bottom, the type hierarchy that never wavers, motion that has a reason
to be there. The page I built to show all this was put together fast to make a point,
and if you have the eye for it, it shows. I say so on the page itself. That gap, between
something that renders and something that feels authored, is a lot of what a frontend engineer
is actually for.

## The charted version

I built the full breakdown as a page of charts: the tier split, where the lines went by
category, how the invisible half accrues across the sixteen days, the three-framework
duplication, and a handful of decisions where the obvious default was the wrong one and I had
to overrule the model. Charts do that story more justice than a paragraph, so I put it there
rather than here.

It is at [/anatomy](/anatomy). The [source for the whole
site](https://github.com/fortunato/fortunatogeelhoed.com) is public if you want to check the
commits yourself.

If this is your kind of question, the other two posts in this set are related: [building this
site three times over](/writing/too-react) and [shipping a Python library in a language I
barely knew](/writing/specialization-is-overrated). Same underlying theme, that the judgment
is the part that carries over.
