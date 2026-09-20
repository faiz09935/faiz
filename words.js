/**
 * words.js
 * -----------------------------------------------------------------------
 * Text data pool for the Typing Speed Test application.
 * Contains categorized sentences/paragraphs of varying difficulty so the
 * generated test text is varied and does not repeat frequently.
 *
 * Exposed globally as `window.TEXT_POOL` and `window.getRandomText()`
 * so it can be consumed directly by script.js without a build step.
 * -----------------------------------------------------------------------
 */

const TEXT_POOL = {
  easy: [
    "The sun is bright today and the sky is blue.",
    "I like to read books in my free time.",
    "She walked to the store to buy some milk.",
    "The cat sat on the mat and took a nap.",
    "We had pizza for dinner last night.",
    "He plays soccer with his friends every weekend.",
    "My favorite color is green and yours is red.",
    "The dog ran fast across the green park.",
    "It is raining outside so bring an umbrella.",
    "They went to the beach to swim and play.",
    "I woke up early to watch the sunrise.",
    "The kids laughed and played in the yard.",
    "She sings a happy song every morning.",
    "We drove to the city to see a movie.",
    "The baby smiled when she saw her mother.",
    "He likes to draw pictures of tall trees.",
    "The bird flew over the tall green tree.",
    "I want to learn how to bake a cake.",
    "The teacher gave us homework for the weekend.",
    "My brother is taller than me by a lot.",
    "The store closes at nine every single night.",
    "She wears a red hat when it is cold.",
    "We planted flowers in the garden today.",
    "The train arrives at the station every hour.",
    "I enjoy walking my dog in the evening.",
    "The coffee was hot and smelled very good.",
    "He fixed his bike after school yesterday.",
    "The moon looked bright in the dark sky.",
    "She wrote a letter to her best friend.",
    "The children built a sandcastle on the beach."
  ],
  medium: [
    "Learning to type quickly and accurately takes consistent practice over time, but the payoff is well worth the effort you put into it.",
    "Technology continues to reshape the way people communicate, work, and interact with each other in both personal and professional settings.",
    "The mountain trail was steep and rocky, yet the breathtaking view from the summit made every difficult step feel completely worthwhile.",
    "Effective time management is one of the most valuable skills a person can develop, especially when juggling multiple responsibilities at once.",
    "The library was quiet except for the soft rustle of pages and the occasional whisper between students studying for their exams.",
    "A balanced diet combined with regular exercise plays a crucial role in maintaining both physical health and mental well-being.",
    "The chef carefully prepared each dish, ensuring that every ingredient was fresh and every flavor complemented the others perfectly.",
    "Traveling to new places allows people to experience different cultures, taste unique cuisines, and gain a broader perspective on life.",
    "The scientist spent years researching the effects of climate change on marine ecosystems around the world.",
    "Reading a wide variety of books can significantly improve vocabulary, critical thinking, and overall communication skills.",
    "The orchestra performed beautifully, blending the sounds of strings, brass, and percussion into a single harmonious piece.",
    "Successful entrepreneurs often share common traits such as resilience, adaptability, and a willingness to take calculated risks.",
    "The old lighthouse stood at the edge of the cliff, guiding ships safely through the rocky coastline for over a century.",
    "Artificial intelligence is transforming industries ranging from healthcare and finance to transportation and entertainment.",
    "Practicing mindfulness for a few minutes each day can help reduce stress and improve overall emotional resilience.",
    "The architecture of the old city blended modern glass buildings with centuries old stone structures in a striking contrast.",
    "Volunteering in the community not only helps others but also provides a strong sense of purpose and personal fulfillment.",
    "The negotiation lasted several hours before both parties finally agreed on terms that satisfied everyone involved.",
    "Understanding basic financial principles like budgeting and saving can lead to greater independence and long term security.",
    "The documentary explored the history of jazz music and its profound influence on modern popular culture.",
    "As the storm approached, the fishermen quickly secured their boats and headed back toward the safety of the harbor.",
    "Good communication in the workplace requires active listening, clarity, and a willingness to consider different viewpoints.",
    "The museum's newest exhibit featured ancient artifacts recovered from a shipwreck discovered decades ago.",
    "Regular practice, patience, and constructive feedback are essential ingredients for mastering any new skill.",
    "The city council debated for weeks before finally approving funding for the new public transportation system."
  ],
  hard: [
    "Notwithstanding the unprecedented complexity of the negotiations, the delegates managed to reconcile their divergent interests and produce a comprehensive agreement that satisfied the majority of stakeholders involved.",
    "The phenomenon of quantum entanglement, wherein two particles remain correlated regardless of the distance separating them, continues to challenge our conventional understanding of causality and locality.",
    "Bureaucratic inefficiencies, compounded by insufficient funding and outdated infrastructure, have repeatedly hindered the government's ability to implement meaningful reforms in a timely manner.",
    "The novel's protagonist grapples with existential questions about identity, memory, and the ephemeral nature of consciousness throughout the labyrinthine narrative structure.",
    "Economists remain divided over whether the recent fluctuations in the stock market reflect underlying structural weaknesses or merely transient investor sentiment.",
    "The archaeological excavation unearthed a trove of artifacts that provided unprecedented insight into the socioeconomic hierarchies of an otherwise poorly documented civilization.",
    "Despite rigorous peer review, the study's methodology was later criticized for failing to account for confounding variables that could have skewed its conclusions.",
    "The intricate interplay between genetic predisposition and environmental factors makes it exceedingly difficult to isolate a single cause for many chronic illnesses.",
    "Philosophers have long debated whether free will is compatible with a deterministic universe governed by immutable physical laws.",
    "The legislation, though well intentioned, inadvertently created loopholes that unscrupulous corporations exploited to circumvent environmental regulations.",
    "Her dissertation examined the sociopolitical ramifications of rapid urbanization on indigenous communities displaced by industrial expansion.",
    "The cryptographic algorithm relies on the computational infeasibility of factoring large prime numbers to ensure the security of encrypted communications.",
    "Critics argue that the film's nonlinear narrative structure, while ambitious, ultimately obfuscates rather than enriches its thematic exploration of memory and trauma.",
    "The committee's recommendations were met with skepticism, as several members questioned the empirical validity of the underlying data.",
    "Climate scientists caution that even incremental increases in global temperature could trigger irreversible feedback loops with catastrophic consequences.",
    "The diplomat's carefully worded statement was deliberately ambiguous, allowing for multiple interpretations depending on the geopolitical context.",
    "Neuroscientists have discovered that neuroplasticity allows the brain to reorganize itself by forming new neural connections throughout an individual's lifetime.",
    "The merger was ultimately dissolved after regulators determined that it would create an unacceptable monopoly within the telecommunications sector.",
    "Postmodern literary theory often interrogates the reliability of language itself as a medium for conveying objective truth.",
    "The judge's ruling set a significant legal precedent regarding the extent to which digital privacy is protected under existing constitutional frameworks."
  ]
};

/**
 * Returns a shuffled array copy (Fisher-Yates) without mutating the input.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates a block of text long enough to cover the requested test
 * duration, mixing sentences from all difficulty pools so text rarely
 * repeats and always contains enough content even for a 120s test.
 *
 * @param {number} durationSeconds - selected test duration (15, 30, 60, 120)
 * @returns {string} generated text block
 */
function getRandomText(durationSeconds) {
  // Rough heuristic: average typist ~ 40-60 WPM => ~5 chars/word.
  // We build enough sentences so the pool never runs out mid-test.
  const targetWordCount = Math.max(60, Math.ceil((durationSeconds / 60) * 220));

  const allSentences = shuffleArray([
    ...TEXT_POOL.easy,
    ...TEXT_POOL.medium,
    ...TEXT_POOL.hard
  ]);

  const chosen = [];
  let wordCount = 0;
  let idx = 0;

  while (wordCount < targetWordCount) {
    if (idx >= allSentences.length) {
      // Reshuffle and continue if we run out (very long durations)
      allSentences.push(...shuffleArray([
        ...TEXT_POOL.easy,
        ...TEXT_POOL.medium,
        ...TEXT_POOL.hard
      ]));
    }
    const sentence = allSentences[idx];
    chosen.push(sentence);
    wordCount += sentence.split(" ").length;
    idx++;
  }

  return chosen.join(" ");
}

// Expose globally for use in script.js (no bundler / module system required)
window.TEXT_POOL = TEXT_POOL;
window.getRandomText = getRandomText;
