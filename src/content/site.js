// Everything the site says lives here. Edit copy in this file only.

export const person = {
  name: 'Faiz Aziz',
  first: 'Faiz',
  last: 'Aziz',
  title: 'Data & AI Delivery Consultant',
  org: 'IBM Expert Labs',
  city: 'London',
  email: 'faizazizatk@gmail.com',
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/faiz-aziz-01524425a/' },
    { label: 'GitHub', url: 'https://github.com/FaizAzizAtK' },
    { label: 'PyPI', url: 'https://pypi.org/project/spart-prompt/' },
  ],
  // Set to a PDF path in /public (e.g. 'Faiz_Aziz_CV.pdf') to show a CV link.
  cvUrl: null,
}

// The first screen answers a recruiter's questions before anything else does.
export const hero = {
  line: 'I build AI agents for places where being wrong is expensive.',
  who: 'Data & AI Delivery Consultant at IBM Expert Labs. I lead IBM’s voice agent work with ElevenLabs, and take agentic AI from first workshop to production for banks, the public sector and many other industries.',
  skills: ['Agentic AI', 'Multi-agent systems', 'Voice agents', 'RAG', 'AI governance'],
  // shown above the skills: the one line of proof a recruiter should see first
  honour: 'Selected for IBM Tech 2027',
  honourNote: 'IBM’s recognition programme for its top technical people.',
}

// Read word by word as it scrolls past.
export const belief = {
  label: 'Why it matters',
  text: 'Normal software crashes when it’s wrong. An agent doesn’t. It gives your customer the wrong answer, confidently, in a calm voice. So my work starts where the demo ends: evals, governance, failure modes, and the person on the other end of the line.',
}

// Selected work. `figure` is the large type the chapter is remembered by.
export const work = [
  {
    id: 'voice',
    kicker: 'Now',
    figure: 'Voice',
    title: 'Giving enterprise agents a voice',
    body: 'I lead IBM’s initiative with ElevenLabs: bespoke voice agents on watsonx Orchestrate for large financial services clients, grounded in each bank’s own knowledge.',
    photo: { src: 'img/podium-cut-800.webp', srcSet: 'img/podium-cut-500.webp 500w, img/podium-cut-800.webp 800w, img/podium-cut-1200.webp 1200w', w: 1200, h: 1536, alt: 'Faiz Aziz in a navy suit, speaking into a microphone beside a lectern' },
    note: 'My voice demos have been shown to the CEO of IBM UK & Ireland. I also help shape which accounts we go after together, and I’m a certified ElevenLabs Partner Deploy Engineer.',
    film: {
      src: 'https://faiz-aziz-ibm.github.io/give-your-agents-a-voice/assets/voice-agents-film.mp4',
      poster: 'https://faiz-aziz-ibm.github.io/give-your-agents-a-voice/assets/film-poster.jpg',
      label: 'Film: give your agents a voice, 1 minute 54 seconds',
    },
  },
  {
    id: 'proof',
    kicker: 'Client work',
    figure: '2.6×',
    count: { to: 2.6, decimals: 1, suffix: '×' },
    title: 'A proof of concept the client paid to grow',
    body: 'A client came back for an MVP worth 2.6 times the proof of concept I helped lead.',
    note: 'The work: agents that apply accessibility guidelines to make a business more accessible, and an AI governance tool that makes their AI safer.',
  },
  {
    id: 'speed',
    kicker: 'Internal tooling',
    figure: '45 min',
    count: { to: 45, decimals: 0, suffix: ' min' },
    title: 'Three days of front-end work, down to 45 minutes',
    body: 'I built an internal accelerator that generates client-branded React front ends over the watsonx Orchestrate Runs API, so every proof of concept reaches a first demo sooner.',
    note: 'Earlier, as an intern: a client prototype built in two weeks that became a paid engagement, and a transparent AI solution I helped ship that cut a client’s operating cost by 90%.',
  },
  {
    id: 'spart',
    kicker: 'Open source',
    figure: '+112%',
    count: { to: 112, decimals: 0, prefix: '+', suffix: '%' },
    title: 'SPART: prompts you can measure',
    body: 'A Python package I published on PyPI. It generates candidate prompts, scores them against your examples, and keeps the one that wins.',
    note: 'Up 112% on syntactic similarity for data transformation. Over 80% semantic match on maths reasoning.',
    links: [
      { label: 'PyPI', url: 'https://pypi.org/project/spart-prompt/' },
      { label: 'GitHub', url: 'https://github.com/FaizAzizAtK/SPART' },
    ],
  },
  {
    id: 'lead',
    kicker: 'Julius Bär, Zürich',
    figure: '10+',
    count: { to: 10, decimals: 0, suffix: '+' },
    title: 'Leading, not just building',
    body: 'I led a global case management project on Workday, so each HR case reaches the right team first time. I mapped the workflows, built Workday Extend apps, and kept more than ten stakeholders across regions pulling the same way.',
  },
]

export const about = {
  label: 'About',
  lead: 'Grew up in Geneva. Studied in London. Building at IBM.',
  body: [
    'I studied Computer Science at Queen Mary University of London and finished with First Class Honours in 2025. I’ve been at IBM since, with a summer at Julius Bär in Zürich in between.',
    'I’d rather understand a system completely, build it properly, and leave something people can depend on after I’ve left the room.',
  ],
  facts: [
    { k: 'Based', v: 'London' },
    { k: 'Speaks', v: 'English, French, Spanish, Urdu, Hindi' },
    { k: 'Degree', v: 'BSc Computer Science, First Class' },
    { k: 'Recognition', v: 'Selected for IBM Tech 2027' },
  ],
}

export const record = {
  experience: [
    { when: '2025–', what: 'IBM Expert Labs', role: 'Data & AI Delivery Consultant', where: 'London' },
    { when: '2025', what: 'Julius Bär', role: 'HR Business Technology Intern', where: 'Zürich' },
    { when: '2024', what: 'IBM', role: 'AI Engineer Intern, named Voice of the Interns', where: 'London' },
    { when: '2024', what: 'McCarthy & Brogan', role: 'Web Developer', where: 'Remote' },
  ],
  education: [
    { when: '2022–25', what: 'Queen Mary University of London', role: 'BSc Computer Science, First Class Honours (78.1%)', where: 'London' },
    { when: '2011–22', what: 'Institut International de Lancy', role: 'IB Diploma, 39/45, Valedictorian', where: 'Geneva' },
  ],
  recognition: [
    { when: '2026', what: 'IBM Tech 2027', role: 'Selected by IBM leadership for its recognition programme for top technical IBMers', where: 'Orlando' },
    { when: '2024', what: 'IBM', role: 'Named Voice of the Interns', where: 'London' },
  ],
  certifications: [
    { when: '2026', what: 'ElevenLabs', role: 'Partner Deploy Engineer' },
    { when: 'Dec 2025', what: 'IBM', role: 'Global Sales School' },
    { when: '2024', what: 'IBM', role: 'watsonx Essentials' },
    { when: '2019', what: 'DELF DALF Suisse', role: 'DELF B2' },
  ],
  toolkit: [
    { k: 'Agents', v: 'watsonx Orchestrate, LangGraph, LangChain, MCP, ElevenLabs' },
    { k: 'Retrieval', v: 'RAG, vector databases, Elasticsearch, embedding models' },
    { k: 'Governance', v: 'EU AI Act alignment, evals, auditability, observability, guardrails' },
    { k: 'Build', v: 'Python, TypeScript, React, Next.js, SQL, Docker' },
    { k: 'Delivery', v: 'Pre-sales, design thinking, workshops, executive briefings' },
  ],
}

export const contact = {
  line: 'Let’s talk about agents that hold up.',
  sub: 'Agentic AI, voice agents, or getting AI past the demo. I read everything.',
}
