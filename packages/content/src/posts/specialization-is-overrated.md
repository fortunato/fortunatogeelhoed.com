---
title: Specialization Is Overrated
slug: specialization-is-overrated
type: post
date: 2026-04-19
tag: Career
description: I shipped a Python library to PyPI with almost no prior Python. With AI in the loop, a senior can now get productive in an unfamiliar ecosystem in hours, not months.
draft: false
---

For most of my career, switching languages was expensive. Not necessarily the syntax, as a senior you can mostly 
pick that up over a weekend or two. The expensive part was everything around it: the idioms a reviewer expects, the packaging 
conventions, the tooling each ecosystem does slightly differently, all the small habits that separate code that 
works from code that looks like a native wrote it. Getting familiar and up to speed with a new language would 
take up to a couple of months (depending on you and the peers you had to learn from). From that perspective, it was 
advisable to specialize in one language and have a long bar on the T of being T-shaped.

Lately my feed has been echoing at me to specialize, own a niche, and go deep on one thing, especially in the age of 
AI. I want to push back on that, and I would rather do that with evidence than with just an opinion, so here is the 
evidence.

I published a library called `market-structure` on PyPI. It analyzes price action in financial markets: swing 
detection, trend state, support and resistance zones. These are patterns a discretionary trader reads off a chart. 
I project these onto a [DataFrame](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html) as calculated 
columns. It has a [Freqtrade](https://www.freqtrade.io/) integration, a full [test suite](https://github.com/fortunato/pymarket-structure/actions/workflows/ci.yml), and the tooling you would expect from something other 
people are meant to depend on (`uv`, `ruff`, `pyright`, `pytest`, pre-commit hooks). It is MIT licensed. You can 
[install it from PyPI](https://pypi.org/project/market-structure/) or read [the source on GitHub](https://github.com/fortunato/pymarket-structure).

Before this I had written maybe fifty lines of Python, ever. TypeScript and Node are my daily work these days. Python 
and I never really crossed paths.

## It is not a toy

I want to be clear about that, because "I built a thing in a language I do not know" usually means a weekend script. 
This is a real library. The test I cared about was whether it actually did something useful, so I backtested it 
using [Freqtrade](https://www.freqtrade.io/). (For the non-traders: a backtest runs a strategy over historical price 
data to see how it would have performed.) I ran a TSI crossover strategy on its own, then the same strategy with a 
market structure filter on top. Returns went from +22.59% to +39.85%, and the Sharpe ratio (a standard risk-adjusted 
return measure) nearly doubled. So the filter measurably improved the strategy's performance, which matches the 
hypothesis.

I also built an interactive viewer for the library output, partially to improve the DX. When I had to choose the 
stack for the frontend, I reached for Angular on purpose. I had not touched it in years. If 
the argument is AI augmentation minimizes the on-ramp when picking up unfamiliar tech, then reaching for the 
framework I had used least recently felt like a fair way to further test the claim. (The viewer has no 
tests, by the way. It is a demo that is not on any critical path, so I left it that way. I'd call that pragmatic 
and not reckless.)

## How did I manage

Claude Code, mostly. In conjunction with [Spec-Kit](https://github.com/github/spec-kit). I carefully described what I 
wanted and captured it in the form of a specification. The domain and the patterns I had spent years applying as a 
trading hobbyist I already understood. The AI handled the Python and the Angular logic where I had 
little to add.

What it did not do is the part that arguably matters the most. It did not decide the architecture, model the domain, or 
choose where to draw the API boundaries. I ran most of the build with the model in study mode, asking it to explain 
its choices as it went, so I came out understanding far more Python than I started with. At times that meant 
discussing the choices that needed to be made and overruling the default choice the AI wanted to run with. This 
meant I made informed decisions about the tooling, the architecture, and the libraries I used.
I would still not call myself a Pythonista. That is sort of the point. I did not need to be one to ship something 
real. At the same time, I am a big step closer to becoming one.

## What actually still counts

If being able to use a language collapses to days instead of weeks or months, you might fairly ask what is left to 
specialize in. Here is what I think actually carried this effort:

- Understanding market structure as a domain, swings, breaks of structure, change of character, well enough to actually model it.
- Knowing what a good library looks like from the outside: a clean API surface, composable functions, types that 
  help rather than make working with it difficult.
- Having opinions about testing, packaging, and developer experience, and knowing which corners are safe to cut.
- Knowing what production-ready actually means, so I could tell when the generated code was close and when it was not.

That last deserves highlighting, and it is worth saying plainly: this only works if you already know what good looks 
like. AI will write you fluent code in any language on request and lots of it. What it will not do is tell you the 
architecture is wrong, that the tests are not really testing anything, or that the API will be miserable to live with in six months. 
That judgment is the thing years of building software gives you. It is what lets a senior engineer point AI at an 
unfamiliar language and know when to accept the output, when to push back, and when to throw it away. The tool 
amplifies that judgment. It does not hand it to you.

None of those four skills belong to a language. They belong to an engineer, and they come with you the moment you 
walk into a new ecosystem. So perhaps the specialization worth having has shifted. It used to be "I know language X 
and its ecosystem". Now it is "I know this domain and I know how to build software". 

## The honest limits

I am not claiming expertise is dead. Someone who has lived in Python for a decade will spot things in my code that I 
never would, and I would genuinely welcome the review. Deep knowledge of a runtime's internals, its performance 
edges, the traps you only learn by getting burned: AI is not replacing that any time soon. Hire the specialist when 
the work demands one. Being placed next to such a specialist, any good senior engineer should be able to thrive from 
day one.

The AI did not write flawless Python here. It got me close enough to publish something people can actually use, and 
a few months ago that would have cost me weeks to months of ramp-up. Now it does not.

The library is [on PyPI](https://pypi.org/project/market-structure/) and the [source is open](https://github.com/fortunato/pymarket-structure). If you look under the hood and tell me where I got the Python wrong, I will fix it.
