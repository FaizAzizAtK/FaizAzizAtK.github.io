// Everything the home page says lives here. Edit copy in this file only.

export const person = {
  name: 'Faiz Aziz',
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
  id: 'hero',
  pigments: ['ultramarine', 'indigo'],
  name: 'I’m Faiz Aziz.',
  headline: 'I build AI agents for places where being wrong is expensive.',
  who: 'Data & AI Delivery Consultant at IBM Expert Labs in London. I lead IBM’s voice agent work with ElevenLabs, and take agentic AI from first workshop to production for banks, the public sector and many other industries.',
  skills: ['Agentic AI', 'Multi-agent systems', 'Voice agents', 'RAG', 'AI governance'],
  cue: 'Six questions follow. About a minute.',
}

// One sheet of paper per question. `pigments` are the two colours poured on it.
// The site lives in one colour world, blues and indigo, with a single warm sheet.
export const questions = [
  {
    id: 'meaning', nav: 'What does that mean?', pigments: ['prussian', 'indigo'],
    q: 'What does that actually mean?',
    blocks: [
      { kind: 'statement', text: 'Normal software crashes when it’s wrong. An agent doesn’t. It gives your customer the wrong answer, confidently, in a calm voice.' },
      { kind: 'body', text: 'So my job starts where the demo ends: evals, governance, failure modes, and the person on the other end of the line.' },
    ],
  },
  {
    id: 'now', layout: 'film', nav: 'What are you working on?', pigments: ['ultramarine', 'phthalo'],
    q: 'What are you working on right now?',
    film: {
      src: 'https://faiz-aziz-ibm.github.io/give-your-agents-a-voice/assets/voice-agents-film.mp4',
      poster: 'https://faiz-aziz-ibm.github.io/give-your-agents-a-voice/assets/film-poster.jpg',
      label: 'Film: give your agents a voice, 1 minute 54 seconds',
    },
    blocks: [
      { kind: 'lead', text: 'Giving agents a voice.' },
      { kind: 'body', text: 'I lead IBM’s initiative with ElevenLabs: bespoke voice agents on watsonx Orchestrate for large financial services clients, grounded in each bank’s own knowledge.' },
      { kind: 'note', text: 'My voice demos have been shown to the CEO of IBM UK & Ireland. I also help shape which accounts we go after together, and I’m a certified ElevenLabs Partner Deploy Engineer.' },
    ],
  },
  {
    // the one warm sheet, and the one that stays mostly bare paper
    id: 'proof', layout: 'split', paper: true, nav: 'Does it hold up?', pigments: ['sienna', 'alizarin'],
    q: 'Does it survive contact with a client?',
    hint: 'The rest of this sheet is yours. Click or tap it.',
    blocks: [
      { kind: 'num', text: '2.6×' },
      { kind: 'body', text: 'A client came back for an MVP worth 2.6 times the proof of concept I helped lead.' },
      { kind: 'note', text: 'The work: agents that apply accessibility guidelines to make a business more accessible, and an AI governance tool that makes their AI safer.' },
    ],
  },
  {
    id: 'speed', layout: 'flip', nav: 'How fast can you move?', pigments: ['phthalo', 'prussian'],
    q: 'How fast can you move?',
    blocks: [
      { kind: 'lead', text: 'Three days became 45 minutes.' },
      { kind: 'body', text: 'I built an internal accelerator that generates client-branded React front ends over the watsonx Orchestrate Runs API, so every proof of concept reaches a first demo sooner.' },
      { kind: 'note', text: 'Earlier, as an intern: a client prototype built in two weeks that became a paid engagement, and a transparent AI solution I helped ship that cut a client’s operating cost by 90%.' },
    ],
  },
  {
    id: 'right', nav: 'How do you know it’s right?', pigments: ['indigo', 'ultramarine'],
    q: 'How do you know it’s right?',
    blocks: [
      { kind: 'lead', text: 'You measure it.' },
      { kind: 'body', text: 'SPART is a Python package I published on PyPI. It generates candidate prompts, scores them against your examples, and keeps the one that wins.' },
      { kind: 'note', text: 'Up 112% on syntactic similarity for data transformation. Over 80% semantic match on maths reasoning.', links: [
        { label: 'PyPI', url: 'https://pypi.org/project/spart-prompt/' },
        { label: 'GitHub', url: 'https://github.com/FaizAzizAtK/SPART' },
      ] },
    ],
  },
  {
    id: 'writing', nav: 'What do you think?', pigments: ['payne', 'indigo'], essays: true,
    q: 'What do you think about all this?',
    blocks: [
      { kind: 'lead', text: 'I write it down.' },
    ],
  },
]

export const record = {
  q: 'Can I get that in writing?',
  summary: 'Data & AI Delivery Consultant, IBM Expert Labs, London',
  nav: 'Can I get that in writing?',
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
  certifications: [
    { when: '2026', what: 'ElevenLabs', role: 'Partner Deploy Engineer' },
    { when: 'Dec 2025', what: 'IBM', role: 'Global Sales School' },
    { when: '2024', what: 'IBM', role: 'watsonx Essentials' },
    { when: '2019', what: 'DELF DALF Suisse', role: 'DELF B2' },
  ],
  toolkit: [
    { k: 'Agents', v: 'watsonx Orchestrate, LangGraph, LangChain, MCP, ElevenLabs' },
    { k: 'Retrieval', v: 'RAG, vector databases, Elasticsearch, embedding models' },
    { k: 'Governance', v: 'EU AI Act alignment, evals, auditability, OAuth on-behalf-of flows' },
    { k: 'Build', v: 'Python, TypeScript, React, Next.js, SQL, Docker' },
    { k: 'Delivery', v: 'Pre-sales, design thinking, workshops, executive briefings' },
    { k: 'Languages', v: 'English and French fluent. Spanish, Urdu and Hindi conversational.' },
  ],
}

export const ending = {
  id: 'end',
  pigments: ['ultramarine', 'indigo'],
  q: 'Is there anything else I can help you with?',
  bio: 'I’m Faiz. I grew up in Geneva, studied Computer Science at Queen Mary in London, and have been at IBM since. I’d rather understand a system completely, build it properly, and leave something people can depend on after I’ve left the room.',
  colophon: 'The colour on this page isn’t an image. It’s pigment and water, simulated live on your device. Stir it, or click to add more.',
}
