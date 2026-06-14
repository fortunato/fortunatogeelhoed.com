---
title: Services
slug: services
type: page
description: "Freelance senior frontend and full-stack engineer and technical lead for EU, NL, and remote teams. Comfortable across stacks (React, Vue, Angular, TypeScript) and quick to pick up a new one. Architecture, performance, AI integration, and tech-debt strategy."
---

I take on senior frontend and full-stack engineering and technical leadership as a freelancer, through my company JiggyBit S.L. In practice that usually means joining a team that needs to ship faster without breaking what already works.

After twenty-five years, across agencies, consultancies, and long client engagements, the part I have really gotten good at is the judgment around the work: which technical debt is worth clearing and which is fine to leave alone, what a system actually needs before you commit to building it, when a piece of generated code is solid enough to ship and when it only looks that way. In my experience that is where a project quietly saves or loses months, more than in any single technical choice.

That judgment does not belong to any one language. Most of my recent work has been in TypeScript, across React, Vue, and Angular, but I have shipped production code in plenty of other stacks, and not long ago I published a Python library to PyPI with almost no prior Python. So when I name specific tools below, read them as where I have spent my time rather than the edges of what I will take on. I have walked into unfamiliar stacks often enough to know I will be useful in yours within a week or two, and properly at home not long after.

The work is rarely just one thing. On a given engagement I might be setting technical direction across a few teams, starting a new project and setting the standard for it, building features hands-on in a big and not always tidy codebase, sitting with designers and domain experts to turn a messy process into something usable, chipping away at technical debt, and bringing people up to speed, often in the same week. So read what follows as a set of things I move between, not a single specialism. The one constant is that the hardest part is rarely the code in front of me. It is how the parts fit and how the people work, and I have learned to pay attention to both.

## What I do

**Full-stack engineering.** Work that runs from the database to the browser and has to keep working once I have moved on. Lately that has mostly meant TypeScript, with React, Vue, or Angular on the front and NestJS, GraphQL, or plain REST behind them, in an Nx monorepo. Over a longer career I have built the same kind of thing in a good few other stacks, and the shape of the job does not change much from one to the next.

**Frontend architecture and design systems.** Frontend work that has to outlast the team that started it. Day to day that means things like packaging a micro-frontend as an npm package and dropping it into several apps, working inside a shared component library, or structuring CSS so it still makes sense past a few hundred components. Keeping the build quick, the bundle small, and the accessibility genuine is part of the job rather than a project of its own.

**Starting things right.** A fair number of times I have been the one handed a blank repository rather than an existing one, and that is somewhere I am at my most useful: picking the structure, the tooling, and the conventions a team will live with for years, and getting the foundations boring and solid before anyone is depending on them. Both this site and my market-structure library on PyPI were started from nothing, and the source of each is public.

**Performance.** I treat performance as something you measure, not something you guess at. At Tele2 I built a Node stack to server-side render the Sim-Only configuration page, and it came out a verified three times faster on Lighthouse, scoring better than the AMP version Google's own consultants had built. I find where the time actually goes, fix the costly things first, and prove the gain with numbers.

**AI integration and automation.** I build with AI in the loop and stay responsible for every line that goes out. I have written custom MCP servers that expose a system's own tools to AI agents and wired agentic workflows into that same system, and I am just as happy pointing that at a process as at a codebase: taking the slow, manual, copy-things-between-tools parts of how a team works and automating a sensible amount of them. What actually matters, either way, is having shipped enough by now to tell when the generated code is right, when to push back, when to throw it out, and when a process is better left in human hands. It is the same judgment that lets me move into an unfamiliar stack quickly: I know what good looks like, so I can tell a solid answer from one that only looks right.

**Technical leadership, from inside the code.** Architecture calls, design reviews, tech-debt strategy, mentoring, and a hand with hiring when the team is growing, without stepping away from the keyboard. At several places I was asked to lead where I had not been hired to, usually because the work around me had become more reliable. I set up the static analysis, tests, and the kind of coverage that actually catches regressions, so correct, legible code stays the default. At Amsterdam I helped take a debt-laden codebase with no tests up to roughly 50% coverage, around 70% with Cypress included, and migrated it to Nx along the way. I was part of the hiring loop there too: drawing up the role profile, screening candidates, and sitting on the interview side. I tend to be a useful judge of senior engineers, more interested in how someone reasons through an unfamiliar problem than which tools happen to be on their CV.

## How I work

The expensive mistakes tend to be made at the whiteboard, not the keyboard. A premature abstraction, the wrong storage engine, a migration sequenced badly: each one costs months once it has shipped. I am usually the person in the room asking the awkward question before the commitment is locked in, and I would rather prove the cheaper path with a small spike than argue it on a slide.

Not all technical debt is worth paying down, either. I help teams tell the difference, rank what is genuinely slowing delivery, and fold the repayment into normal feature work, so the codebase gets healthier without a stop-the-world rewrite.

I have worked remotely for Dutch and Australian teams from four countries over the years, so async collaboration and self-direction are not new to me. I am happy embedded in a team or running a piece of work end to end.

## How to engage me

- **Consulting and review.** An architecture call, a performance audit, a second opinion on a decision before it is locked in, or a hand with a hire from the role profile through the interview. Short, focused, and often the highest-leverage way to start.
- **Freelance delivery.** I join your team and ship: a new build set up to last, a feature, a migration, a frontend rebuilt from the ground up, a debt-reduction effort folded into the roadmap.
- **Longer engagement.** A sustained role leading frontend or full-stack work, the kind of relationship most of my career has been built on.

Remote across the EU, or on-site when it makes sense. The market is NL and Europe first, but I have worked with teams further afield too.

## Is this a fit?

This tends to land well in two situations. One is an established codebase and the constraints that come with it: technical debt that is starting to bite, a frontend that needs to scale or perform, a migration nobody wants to own, or a team that would benefit from a senior hand who lifts the people around them. The other is a new project you want set up properly from the first commit, by someone who has done it enough to know which foundations will matter later.

The whole site is built three times, in React, Vue, and Angular, from one shared stylesheet and one backend I wrote to serve all three. The source is public, so if you want to check whether any of the above is true, you can read every line.

If that sounds like what you need, [tell me what you're building or fixing](/contact) and I'll get back to you.
