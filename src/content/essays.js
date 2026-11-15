// Essays. Plain data (no JSX) so vite.config.js can read it at build time
// and write a static page with its own title and preview tags per essay.

const POSTS = {
  'voice': {
    title: 'Why Can’t I Just Talk to My Bank?',
    date: "Nov 2026",
    body: [
      { type: 'lead', text: "More and more people talk to ChatGPT out loud now. On the walk to work, while cooking, in the car. Then they phone their bank and get told to press 1." },
      { type: 'p', text: "Voice used to be the gimmick. The thing you showed someone once and never used again. That's changed. People use it to explain a letter they don't understand, rehearse a difficult conversation, plan a trip, settle an argument. They don't think of it as using AI. They think of it as asking." },
      { type: 'p', text: "And once you've had that, almost every other conversation with a company feels like going backwards." },
      { type: 'h2', text: "Imagine you've just moved country" },
      { type: 'p', text: "New job, new city, and the local language isn't your first. You've got a couple of weeks to open a bank account, register your address, sort out health insurance and move your phone contract. Every one of those is a form, a phone line or a branch appointment, and every one of them is in a language you can get by in but don't think in." },
      { type: 'p', text: "You can read the words. You just can't read them fast, and you can't tell which bits matter. Is the 'Kontoführungsgebühr' something you pay once or every month? Does this insurance form want your permit number or your social security number? You end up on hold, then in a menu, then repeating your date of birth to a third person who transfers you back to the first." },
      { type: 'p', text: "Now picture the same fortnight with a friend who's lived there for ten years. They speak your language and theirs. They know which form matters. They come with you to the counter, explain what the clerk means, and tell you when it's fine to just sign. Same bank, same rules, same paperwork. A completely different experience." },
      { type: 'p', text: "That friend is what a good enterprise voice agent should be." },
      { type: 'h2', text: "The menu is the problem" },
      { type: 'p', text: "Most companies already have voice. It's called the phone tree. Press 1 for accounts, 2 for cards, 3 for everything that isn't 1 or 2. It was designed for the company, not the caller: a way to route you to the right queue as cheaply as possible." },
      { type: 'p', text: "A phone tree is a building where every door is numbered and nothing is signposted. You can get anywhere, as long as you already know where you're going. And the people who most need help (new arrivals, older customers, anyone stressed, anyone not fluent) are exactly the people who don't." },
      { type: 'p', text: "A voice agent turns that around. You don't navigate the menu. You say what's going on, in your own words, in whichever language you're most comfortable in, and the menu navigates for you." },
      { type: 'h2', text: "Sounding human is the easy part" },
      { type: 'p', text: "Here's what gets lost in the excitement. Making an agent sound human is now the easy bit. The voices I work with through ElevenLabs are good enough that people forget they're talking to software within a sentence or two. That's exactly why everything behind the voice has to be right." },
      { type: 'p', text: "A chatbot that gets something wrong shows you text you can reread. A voice agent that gets something wrong tells you warmly, confidently, at the speed of conversation. You don't scroll back. You just believe it. In a bank or an insurer, that's the difference between a bad experience and a formal complaint." },
      { type: 'p', text: "So the voice agents I build on watsonx Orchestrate start from the same place as any other agent: what is it allowed to know, what is it allowed to do, and how does it know when to stop." },
      { type: 'p', text: "Grounded: it answers from the bank's own policies and products, not from whatever the model picked up on the internet. Connected: it doesn't just explain how to update your address, it updates it, through the same systems and the same checks a member of staff would use. Bounded: it knows which requests it can close and which need a person, and it hands over with the whole conversation attached, so you never have to start again." },
      { type: 'h2', text: "What it changes" },
      { type: 'p', text: "Language stops being a barrier. A customer can start in English, switch to French when the detail gets tricky, and the agent follows them. Nobody has to find the one colleague who happens to speak Urdu." },
      { type: 'p', text: "Accessibility stops being an afterthought. For someone with poor eyesight, or who finds forms hard, or who never got comfortable with apps, speaking is the most natural interface there is. For twenty years we've asked everyone to learn our interfaces. Voice is the first one that learns theirs." },
      { type: 'p', text: "Waiting stops being the default. No hold music at eleven on a Sunday night, when you've finally found the time to deal with it." },
      { type: 'p', text: "And for the business, every conversation is transcribed, every action is logged, and every answer can be traced back to a source. That's a far easier story to tell a compliance team than a call centre where what was said lives in someone's memory." },
      { type: 'h2', text: "Where this goes" },
      { type: 'p', text: "The pattern is already visible in consumer AI. First people typed to it. Then they talked to it. Next they'll expect it to do things for them. Enterprises will follow the same arc, just more slowly, because the stakes are higher. That's not a reason to wait. It's a reason to build it properly." },
      { type: 'p', text: "The vision isn't a call centre with fewer people in it. It's a front door where anyone, in any language, at any hour, can say what they need and have it handled properly, and where the people who work there spend their time on the conversations that genuinely need a human." },
      { type: 'p', text: "Back to that first fortnight in a new country. The paperwork doesn't get simpler. The rules don't change. What changes is that you're no longer facing them alone, in a language you don't think in, pressing 1 and hoping. You just ask." },
      { type: 'p', text: "That's what voice should feel like. Not a gimmick. A local friend who happens to work at your bank." },
    ],
  },
  'agentic-shift': {
    title: "The Agentic Shift",
    date: "2025",
    readTime: "5 min read",
    body: [
      {
        type: 'lead',
        text: "The shift from co-pilot to autonomous agent is real. But the timeline in your head is probably wrong.",
      },
      {
        type: 'p',
        text: "Every week I'm in a client meeting where someone shows a demo of an AI agent doing something impressive: researching a market, drafting a proposal, executing a workflow end to end. The demo is real. The capability is real. Then the meeting ends and we go back to talking about proof of concepts.",
      },
      {
        type: 'p',
        text: "That's not cynicism. It's just where most enterprises are right now.",
      },
      {
        type: 'h2',
        text: "What's actually changing",
      },
      {
        type: 'p',
        text: "The co-pilot model was the first wave. AI augments a human doing the work: you ask, it responds, you decide. The human stays in the loop at every step. Agents are different. An agent doesn't just respond. It plans, executes, observes the result, and acts again. You give it a goal, not a question.",
      },
      {
        type: 'p',
        text: "The architecture that enables this (perceive, reason, act, observe, repeat) works. I've built systems that use this loop to automate knowledge work that would have taken hours of coordination: reading a document, extracting structured data, updating records, flagging anomalies, drafting a response. When it works, the time savings aren't marginal. They're an order of magnitude.",
      },
      {
        type: 'h2',
        text: "But most clients aren't there yet",
      },
      {
        type: 'p',
        text: "Here's what I see in the field: most enterprise AI projects are still in experimentation mode. There's a POC running in a sandbox somewhere. A small team is excited. The business is cautious.",
      },
      {
        type: 'p',
        text: "And the business is right to be cautious.",
      },
      {
        type: 'p',
        text: "Agents fail differently to traditional software. They don't throw exceptions. They don't return 404s. They confidently produce wrong answers, reasoning correctly through a task and still getting the conclusion wrong because of something subtle in how the problem was framed. The failures are quiet and hard to catch until something important goes wrong.",
      },
      {
        type: 'p',
        text: "The trust problem goes beyond hallucinations. When an agent makes a decision (routes a ticket, updates a record, sends a communication) and it's wrong, who's accountable? That question doesn't have a clean answer yet. Most enterprises I work with aren't avoiding agentic AI because they don't see the value. They're avoiding it because they can't explain the risk to their compliance team.",
      },
      {
        type: 'h2',
        text: "What earning trust actually looks like",
      },
      {
        type: 'p',
        text: "The agent deployments I've seen that are actually in production all share one thing: they're specific.",
      },
      {
        type: 'p',
        text: "Not 'an agent that handles customer queries.' An agent that handles one category of query, for one product, with a defined set of actions it can take and a human escalation path for everything else. Narrow scope. Observable behaviour. Gradual expansion.",
      },
      {
        type: 'p',
        text: "Trust isn't given to agents. It's accumulated through track record. The teams doing this well treat trust as an engineering problem. They measure it. Pass rates on eval sets. Accuracy on held-out cases. Escalation rates. They know what the agent handles reliably and where it needs help.",
      },
      {
        type: 'h2',
        text: "The question nobody answers in the demo",
      },
      {
        type: 'p',
        text: "The hardest thing to show in a demo isn't capability. It's failure mode. What happens when the agent is wrong? How does it fail? How do you know? What happens next?",
      },
      {
        type: 'p',
        text: "Until you can answer those questions for the specific workflow you're automating, you're not ready for production. That's not an indictment of agents, it's how you should approach any system that touches real decisions.",
      },
      {
        type: 'p',
        text: "The agentic shift is real. The architecture is right. But the path to that future goes through the unglamorous work of defining scope, building evals, and earning trust incrementally. It doesn't go through demos. That's slower than the hype suggests. It's also more durable.",
      },
    ],
  },

  'hrag': {
    title: "Is RAG That Simple?",
    date: "Mar 2026",
    readTime: "5 min read",
    body: [
      {
        type: 'lead',
        text: "Most teams implement RAG in an afternoon. Embed your docs, store the vectors, retrieve the top-k at query time. Done. Except in production, it isn't.",
      },
      {
        type: 'p',
        text: "RAG (Retrieval-Augmented Generation) is one of the most practical patterns in production AI. Instead of relying purely on what an LLM was trained on, you give it access to your documents at query time. A question comes in, your system searches a knowledge base, pulls the relevant chunks, and passes them to the model alongside the question. The model answers from retrieved context, not memorised patterns.",
      },
      {
        type: 'p',
        text: "It works. It's useful. And for a lot of teams, the basic version gets them 80% of the way there.",
      },
      {
        type: 'p',
        text: "But that last 20% is where agents live. And flat RAG doesn't survive it.",
      },
      {
        type: 'h2',
        text: "Is RAG that simple?",
      },
      {
        type: 'p',
        text: "The standard approach treats your documents as a flat pool. Every chunk of text gets embedded as a vector and stored in a database. When a query comes in, the system searches the entire pool and returns the chunks semantically closest to the question.",
      },
      {
        type: 'p',
        text: "Simple, right? The problem is that 'semantically close' isn't the same as 'correct'.",
      },
      {
        type: 'p',
        text: "Flat RAG has no concept of document structure. It doesn't know your 40-page technical policy is split into sections, that section 3 covers security and section 7 covers pricing. It sees thousands of chunks of similar-sounding text and picks whichever ones score highest on a similarity metric.",
      },
      {
        type: 'p',
        text: "So when a query is specific but the document is dense, you get a predictable failure: the system retrieves chunks that are on-topic but wrong: from the right document but the wrong section, from an outdated version, or subtly contradicting what was actually asked. The model receives this confused context and either fabricates a confident answer or hedges uselessly. Both are bad in production.",
      },
      {
        type: 'h2',
        text: "What structure gives you",
      },
      {
        type: 'p',
        text: "Hierarchical RAG (HRAG) adds a layer of structure that flat RAG is missing. Instead of one flat index, it builds two: a high-level index of document summaries and sections, and lower-level indexes of the actual content within each section.",
      },
      {
        type: 'p',
        text: "The retrieval process mirrors how a person reads a long document. You don't scan every paragraph looking for the answer. You read the table of contents, find the relevant chapter, then read that chapter closely.",
      },
      {
        type: 'p',
        text: "In practice: a query hits the high-level index first. The system identifies which sections or documents are most relevant, not which chunks. Then it does a targeted search within those sections only. Instead of searching 10,000 chunks and grabbing 5 from across the entire corpus, you search 50 section summaries, pick the 2 most relevant, and retrieve the best 5 chunks from within those 2 sections.",
      },
      {
        type: 'p',
        text: "The context the model receives is focused, coherent, and correct. That's the difference.",
      },
      {
        type: 'h2',
        text: "Why agents can't afford the noise",
      },
      {
        type: 'p',
        text: "Co-pilots can tolerate retrieval noise. A human reading the output catches when something seems off and asks a follow-up. Agents can't do that.",
      },
      {
        type: 'p',
        text: "In an agentic workflow, the retrieved context feeds directly into a reasoning chain that produces a decision: which record to update, which action to take, which message to send. If the retrieval step returns irrelevant or contradictory content, the agent reasons confidently from bad premises. The failure is silent, downstream, and often hard to trace back to the retrieval step.",
      },
      {
        type: 'p',
        text: "The teams building agents that hold up in production treat retrieval as a first-class engineering concern. Not a library call. Not a solved problem. A system with real failure modes that needs to be designed deliberately.",
      },
      {
        type: 'p',
        text: "So, is RAG that simple? For demos and prototypes, yes. For agents that have to be right, the architecture of how they retrieve matters as much as the model powering them. HRAG is what that looks like.",
      },
    ],
  },

  'prompting-interface': {
    title: "Context Is the New Code",
    date: "2025",
    readTime: "5 min read",
    body: [
      {
        type: 'lead',
        text: "Most teams have figured out prompting. The harder problem, the one that actually breaks production agents, is context.",
      },
      {
        type: 'p',
        text: "A year ago, every conversation was about prompts. How to write them, how to structure them, what format to request. That conversation has mostly resolved. There are patterns now: system prompt structure, few-shot examples, chain-of-thought formatting. If you've built more than two LLM applications, you probably have a rough mental model of what makes a prompt work.",
      },
      {
        type: 'p',
        text: "Context is different. Context is harder. And context is where agents actually fail.",
      },
      {
        type: 'h2',
        text: "What context engineering is",
      },
      {
        type: 'p',
        text: "When I say context, I mean everything in the model's context window at inference time. Not just the system prompt: the conversation history, retrieved documents, tool call results, memory summaries, intermediate reasoning. All of it.",
      },
      {
        type: 'p',
        text: "Context engineering is the discipline of managing what goes in there deliberately. What you include. What you cut. How you order it. How you compress older context so it doesn't crowd out what's relevant now. It sounds like an optimisation problem. It's more like an editorial problem. You're deciding what the model gets to know before it has to act.",
      },
      {
        type: 'h2',
        text: "Context rot",
      },
      {
        type: 'p',
        text: "Here's something that doesn't get talked about enough: agents get worse over time.",
      },
      {
        type: 'p',
        text: "Not because the model changes. Because the context accumulates. A long-running agent starts clean: clear instructions, relevant context, good signal. But as it executes, the window fills up. Tool call results from earlier steps pile in. Intermediate reasoning from past actions takes up space. Old context that was relevant three steps ago is still there, slightly contradicting the new context that arrived after it.",
      },
      {
        type: 'p',
        text: "The model doesn't throw an error. It doesn't tell you the context is confusing. It just starts making slightly worse decisions, conflating things it shouldn't, missing details it would have caught at the start of the run.",
      },
      {
        type: 'p',
        text: "I've seen this on live agent deployments: a workflow that performed well in testing starts degrading in production after longer runs. The prompt didn't change. The tools didn't change. The context got messy. That's context rot, silent, gradual, and where a lot of production agent failures actually originate.",
      },
      {
        type: 'h2',
        text: "What to do about it",
      },
      {
        type: 'p',
        text: "Treat context as a first-class engineering concern. In practice, that means four things.",
      },
      {
        type: 'p',
        text: "Retrieval precision matters more than people think. Dumping everything remotely relevant into the context is the RAG equivalent of a prompt that says 'do everything.' The model attends better when retrieved content is specific to the current step. Chunk well. Retrieve precisely.",
      },
      {
        type: 'p',
        text: "Memory design is not optional for long-running agents. If an agent runs for more than a handful of steps, you need an architecture that summarises and compresses earlier context, not just appends to it. What does the agent actually need to remember? What can be discarded?",
      },
      {
        type: 'p',
        text: "Tool call hygiene is underrated. Every tool result that comes back into the context takes up space and can introduce noise. Structure the results. Strip what isn't needed. Be deliberate about what gets returned.",
      },
      {
        type: 'p',
        text: "Context ordering affects reasoning. In long contexts, models attend differently to information at the start versus the middle versus the end. This isn't a bug to work around. It's a property to design for. Put important instructions near the start and end. Noisy content in the middle.",
      },
      {
        type: 'h2',
        text: "The reframe",
      },
      {
        type: 'p',
        text: "Prompting is about writing a good question. Context engineering is about making sure the model has the right information to answer it.",
      },
      {
        type: 'p',
        text: "That distinction matters. You can have a well-crafted prompt and still get poor outputs if the context is cluttered, stale, or badly ordered. Most of the agent failures I've diagnosed in production weren't prompt problems. They were context problems.",
      },
      {
        type: 'p',
        text: "The teams doing this well treat context as a resource to be managed: budgeted, curated, and maintained. Not a buffer that fills up until something breaks.",
      },
    ],
  },
}


// Curly quotes and apostrophes, so the source text can stay plain ASCII.
const smart = (t) => t.replace(/(^|[\s(“])'/g, '$1‘').replace(/'/g, '’').replace(/(^|[\s(])"/g, '$1“').replace(/"/g, '”')
const typeset = (body) => body.map((b) => ({ ...b, text: smart(b.text) }))

// Place the essay's diagram right after the paragraph it illustrates.
const withFigure = (e) => {
  const i = e.body.findIndex((b) => b.text.startsWith(e.figureAfter))
  if (i < 0) return e.body.concat({ type: 'figure', text: '' })
  return [...e.body.slice(0, i + 1), { type: 'figure', text: '' }, ...e.body.slice(i + 1)]
}

const words = (body) => body.reduce((n, b) => n + b.text.split(/\s+/).length, 0)
const minutes = (body) => Math.max(1, Math.round(words(body) / 230))

export const ESSAYS = [
  {
    slug: 'why-cant-i-just-talk-to-my-bank',
    title: 'Why Can’t I Just Talk to My Bank?',
    date: '2026-11',
    dateLabel: 'Nov 2026',
    dek: "People already talk to ChatGPT every day. Enterprise agents should work the same way: you say what you need, in your own language, and it gets done.",
    pigments: ['ultramarine', 'indigo'],
    figure: 'voice',
    figureAfter: "A voice agent turns that around",
    body: typeset(POSTS['voice'].body),
  },
  {
    slug: 'is-rag-that-simple',
    title: 'Is RAG That Simple?',
    date: '2026-03',
    dateLabel: 'Mar 2026',
    dek: 'Flat RAG searches everything and hopes. Hierarchical RAG reads the contents page first, then the chapter. Why that matters once an agent has to act on what it retrieves.',
    pigments: ['prussian', 'indigo'],
    figure: 'hrag',
    figureAfter: "In practice: a query hits",
    body: typeset(POSTS['hrag'].body),
  },
  {
    slug: 'your-context-is-rotting',
    title: 'Your Context Is Rotting',
    date: '2026-02',
    dateLabel: 'Feb 2026',
    dek: 'Most teams have prompting figured out. What breaks long-running agents is the context window slowly filling with stale tool results and old reasoning.',
    pigments: ['indigo', 'payne'],
    figure: 'context',
    figureAfter: "Not because the model changes",
    body: typeset(POSTS['prompting-interface'].body),
  },
  {
    slug: 'the-agentic-shift',
    title: 'The Agentic Shift',
    date: '2026-01',
    dateLabel: 'Jan 2026',
    dek: 'The move from co-pilot to agent is real. What slows it down inside enterprises is trust, scope and evals, and none of that shows up in a demo.',
    pigments: ['ultramarine', 'phthalo'],
    figure: 'loop',
    figureAfter: "The co-pilot model was the first wave",
    body: typeset(POSTS['agentic-shift'].body),
  },
].map((e) => ({ ...e, body: withFigure(e), minutes: minutes(e.body) }))

export const essayBySlug = (slug) => ESSAYS.find((e) => e.slug === slug)
