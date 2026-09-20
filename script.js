/**
 * script.js
 * -----------------------------------------------------------------------
 * Core application logic for the TypeSpeed Typing Test.
 * Handles: duration selection, text generation, real-time typing
 * capture & highlighting, live stats (WPM/accuracy/timer), results
 * calculation, and restart flow.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  /* ============================== DOM refs ============================== */

  const textDisplay = document.getElementById('textDisplay');
  const hiddenInput = document.getElementById('hiddenInput');
  const focusHint = document.getElementById('focusHint');

  const configBar = document.getElementById('configBar');
  const timeOptions = document.querySelectorAll('.time-option');

  const liveTimerEl = document.getElementById('liveTimer');
  const liveWpmEl = document.getElementById('liveWpm');
  const liveAccuracyEl = document.getElementById('liveAccuracy');

  const typingScreen = document.getElementById('typingScreen');
  const resultsScreen = document.getElementById('resultsScreen');

  const restartBtn = document.getElementById('restartBtn');
  const restartBtnHeader = document.getElementById('restartBtnHeader');

  const resNetWpm = document.getElementById('resNetWpm');
  const resGrossWpm = document.getElementById('resGrossWpm');
  const resAccuracy = document.getElementById('resAccuracy');
  const resTime = document.getElementById('resTime');
  const resCorrectChars = document.getElementById('resCorrectChars');
  const resIncorrectChars = document.getElementById('resIncorrectChars');
  const resTotalChars = document.getElementById('resTotalChars');
  const resMistakes = document.getElementById('resMistakes');

  /* ============================== State ============================== */

  const state = {
    duration: 30,          // selected test duration in seconds
    timeLeft: 30,          // countdown remaining
    timerId: null,         // setInterval handle
    started: false,        // has the test started (first keystroke)
    finished: false,       // has the test ended

    targetText: '',        // the text the user must type
    typedChars: [],        // array of {char, status: 'correct'|'incorrect'} per index typed
    currentIndex: 0,       // index of the next character to type

    totalKeystrokes: 0,    // every character keystroke (for gross WPM / accuracy)
    correctKeystrokes: 0,  // keystrokes that were correct at time of entry
    incorrectKeystrokes: 0,// keystrokes that were incorrect at time of entry
    totalMistakes: 0,      // count of every incorrect keystroke ever made (incl. corrected)

    startTime: null        // timestamp of first keystroke
  };

  /* ============================== Initialization ============================== */

  function init() {
    attachConfigListeners();
    attachInputListeners();
    attachRestartListeners();
    loadNewTest(state.duration);
  }

  /**
   * Loads a fresh test: generates new text, resets all state and stats,
   * and renders the text display ready for typing.
   * @param {number} duration
   */
  function loadNewTest(duration) {
    clearInterval(state.timerId);

    state.duration = duration;
    state.timeLeft = duration;
    state.timerId = null;
    state.started = false;
    state.finished = false;

    state.targetText = window.getRandomText(duration);
    state.typedChars = new Array(state.targetText.length).fill(null);
    state.currentIndex = 0;

    state.totalKeystrokes = 0;
    state.correctKeystrokes = 0;
    state.incorrectKeystrokes = 0;
    state.totalMistakes = 0;
    state.startTime = null;

    // Reset UI
    resultsScreen.classList.add('hidden');
    typingScreen.classList.remove('hidden');
    textDisplay.classList.remove('finished', 'blurred');
    configBar.classList.remove('locked');
    focusHint.classList.remove('hidden-hint');
    focusHint.textContent = 'Click here or press any key to focus and start typing';

    liveTimerEl.textContent = state.timeLeft;
    liveWpmEl.textContent = '0';
    liveAccuracyEl.textContent = '100%';

    hiddenInput.value = '';
    renderText();
  }

  /* ============================== Config bar (duration selection) ============================== */

  function attachConfigListeners() {
    timeOptions.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.started && !state.finished) return; // don't allow mid-test switch
        timeOptions.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const duration = parseInt(btn.dataset.time, 10);
        loadNewTest(duration);
      });
    });
  }

  /* ============================== Rendering ============================== */

  /**
   * Renders the target text into the display, wrapping every character
   * in a span with a class reflecting its current status:
   * correct / incorrect / current / untouched.
   */
  function renderText() {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < state.targetText.length; i++) {
      const ch = state.targetText[i];
      const span = document.createElement('span');
      span.className = 'char';
      span.dataset.index = i;
      span.textContent = ch;

      const entry = state.typedChars[i];
      if (entry) {
        span.classList.add(entry.status); // 'correct' | 'incorrect'
        if (entry.status === 'incorrect' && ch === ' ') {
          span.classList.add('is-space');
        }
      }
      if (i === state.currentIndex) {
        span.classList.add('current');
      }

      frag.appendChild(span);
    }

    textDisplay.innerHTML = '';
    textDisplay.appendChild(frag);
    scrollActiveIntoView();
  }

  /**
   * Efficiently updates only the characters affected by the latest
   * keystroke rather than re-rendering the entire text block (better
   * perf on long 120s texts, smoother highlighting).
   */
  function updateCharSpan(index) {
    const span = textDisplay.querySelector(`.char[data-index="${index}"]`);
    if (!span) return;
    span.classList.remove('correct', 'incorrect', 'current', 'is-space');
    const entry = state.typedChars[index];
    if (entry) {
      span.classList.add(entry.status);
      if (entry.status === 'incorrect' && state.targetText[index] === ' ') {
        span.classList.add('is-space');
      }
    }
  }

  function setCurrentSpan(newIndex, oldIndex) {
    if (oldIndex !== null && oldIndex !== undefined) {
      const oldSpan = textDisplay.querySelector(`.char[data-index="${oldIndex}"]`);
      if (oldSpan) oldSpan.classList.remove('current');
    }
    const newSpan = textDisplay.querySelector(`.char[data-index="${newIndex}"]`);
    if (newSpan) newSpan.classList.add('current');
    scrollActiveIntoView();
  }

  function scrollActiveIntoView() {
    const activeSpan = textDisplay.querySelector('.char.current');
    if (activeSpan) {
      const displayRect = textDisplay.getBoundingClientRect();
      const spanRect = activeSpan.getBoundingClientRect();
      if (spanRect.bottom > displayRect.bottom || spanRect.top < displayRect.top) {
        activeSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }

  /* ============================== Input handling ============================== */

  function attachInputListeners() {
    // Clicking anywhere on the text area focuses the hidden input
    textDisplay.addEventListener('click', () => {
      if (!state.finished) hiddenInput.focus();
    });

    hiddenInput.addEventListener('focus', () => {
      textDisplay.classList.remove('blurred');
      textDisplay.classList.add('focused');
      focusHint.classList.add('hidden-hint');
    });

    hiddenInput.addEventListener('blur', () => {
      textDisplay.classList.remove('focused');
      if (!state.finished) {
        textDisplay.classList.add('blurred');
        focusHint.classList.remove('hidden-hint');
        focusHint.textContent = 'Click here to resume typing';
      }
    });

    // Use 'keydown' to reliably catch Backspace, and 'input' style logic
    // is handled manually via keydown for precise control over each keystroke.
    hiddenInput.addEventListener('keydown', handleKeyDown);

    // Autofocus on load for desktop convenience
    window.addEventListener('load', () => {
      hiddenInput.focus();
    });
  }

  function handleKeyDown(e) {
    if (state.finished) return;

    // Ignore modifier-only presses and non-character control keys we don't handle
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End',
      'PageUp', 'PageDown', 'Insert', 'Delete', 'F1', 'F2', 'F3', 'F4',
      'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];
    if (ignoredKeys.includes(e.key)) return;

    // Block browser shortcuts like Ctrl+A / Cmd+R from interfering, but
    // allow normal typing to proceed untouched.
    if (e.ctrlKey || e.metaKey) return;

    e.preventDefault();

    if (e.key === 'Backspace') {
      handleBackspace();
      return;
    }

    // Only accept single printable characters (letters, numbers, punctuation, space)
    if (e.key.length !== 1) return;

    handleCharacterInput(e.key);
  }

  function handleCharacterInput(typedChar) {
    // Start the timer on the very first valid keystroke
    if (!state.started) {
      startTest();
    }

    // If we've already reached (or passed) the end of the text, stop.
    if (state.currentIndex >= state.targetText.length) return;

    const expectedChar = state.targetText[state.currentIndex];
    const isCorrect = typedChar === expectedChar;
    const status = isCorrect ? 'correct' : 'incorrect';

    state.typedChars[state.currentIndex] = { char: typedChar, status };

    state.totalKeystrokes++;
    if (isCorrect) {
      state.correctKeystrokes++;
    } else {
      state.incorrectKeystrokes++;
      state.totalMistakes++;
    }

    const oldIndex = state.currentIndex;
    updateCharSpan(oldIndex);
    state.currentIndex++;
    setCurrentSpan(state.currentIndex, oldIndex);

    updateLiveStats();

    // If the user finished typing the entire generated block early
    // (e.g. short duration + fast typist), extend text seamlessly.
    if (state.currentIndex >= state.targetText.length) {
      extendText();
    }
  }

  function handleBackspace() {
    if (state.currentIndex === 0) return;

    const targetIndex = state.currentIndex - 1;
    const previousEntry = state.typedChars[targetIndex];

    // Adjust running correct/incorrect keystroke counters since that
    // character is no longer "committed" — this keeps live accuracy
    // meaningful while still counting the historical mistake in totals.
    if (previousEntry) {
      if (previousEntry.status === 'correct') {
        state.correctKeystrokes = Math.max(0, state.correctKeystrokes - 1);
      } else {
        state.incorrectKeystrokes = Math.max(0, state.incorrectKeystrokes - 1);
      }
      state.totalKeystrokes = Math.max(0, state.totalKeystrokes - 1);
    }

    state.typedChars[targetIndex] = null;
    const oldIndex = state.currentIndex;
    state.currentIndex = targetIndex;

    updateCharSpan(oldIndex);
    updateCharSpan(targetIndex);
    setCurrentSpan(state.currentIndex, oldIndex);

    updateLiveStats();
  }

  /**
   * Appends more generated text to the target when the user has typed
   * through the entire initially generated block before time runs out.
   */
  function extendText() {
    const extra = window.getRandomText(state.duration);
    const startLen = state.targetText.length;
    state.targetText += ' ' + extra;
    state.typedChars = state.typedChars.concat(new Array(extra.length + 1).fill(null));

    // Append only the new spans for performance
    const frag = document.createDocumentFragment();
    for (let i = startLen; i < state.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.dataset.index = i;
      span.textContent = state.targetText[i];
      frag.appendChild(span);
    }
    textDisplay.appendChild(frag);
    setCurrentSpan(state.currentIndex, null);
  }

  /* ============================== Timer & lifecycle ============================== */

  function startTest() {
    state.started = true;
    state.startTime = Date.now();
    configBar.classList.add('locked');

    state.timerId = setInterval(() => {
      state.timeLeft--;
      liveTimerEl.textContent = state.timeLeft;
      updateLiveStats();

      if (state.timeLeft <= 0) {
        endTest();
      }
    }, 1000);
  }

  function endTest() {
    if (state.finished) return;
    state.finished = true;
    clearInterval(state.timerId);
    hiddenInput.blur();

    textDisplay.classList.add('finished');
    textDisplay.classList.remove('blurred', 'focused');
    focusHint.classList.add('hidden-hint');

    showResults();
  }

  /* ============================== Stats calculations ============================== */

  /**
   * Elapsed time in minutes since the test started (for live stats,
   * uses actual elapsed time; for final results, uses full test duration
   * or elapsed time if the user finished text early).
   */
  function getElapsedMinutes() {
    if (!state.startTime) return 0;
    const elapsedMs = Date.now() - state.startTime;
    return elapsedMs / 1000 / 60;
  }

  function updateLiveStats() {
    const minutes = getElapsedMinutes();

    // Gross WPM uses the standard convention: (all typed chars / 5) / minutes
    const grossWpm = minutes > 0
      ? Math.round((state.totalKeystrokes / 5) / minutes)
      : 0;

    liveWpmEl.textContent = grossWpm > 0 ? grossWpm : 0;

    const accuracy = state.totalKeystrokes > 0
      ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
      : 100;

    liveAccuracyEl.textContent = `${accuracy}%`;
  }

  function showResults() {
    const elapsedSeconds = state.startTime
      ? Math.max(1, Math.round((Date.now() - state.startTime) / 1000))
      : state.duration;
    const minutes = elapsedSeconds / 60;

    const correctChars = state.correctKeystrokes;
    const incorrectChars = state.incorrectKeystrokes;
    const totalChars = correctChars + incorrectChars;

    // Gross WPM: all typed characters (correct + incorrect) / 5, per minute
    const grossWpm = minutes > 0 ? Math.round((totalChars / 5) / minutes) : 0;

    // Net WPM: standard formula = Gross WPM - (uncorrected errors / minutes)
    // Using: ((totalChars/5) - incorrectChars) / minutes, floored at 0
    const rawNet = minutes > 0 ? ((totalChars / 5) - incorrectChars) / minutes : 0;
    const netWpm = Math.max(0, Math.round(rawNet));

    const accuracy = totalChars > 0
      ? Math.round((correctChars / totalChars) * 100)
      : 100;

    resNetWpm.textContent = netWpm;
    resGrossWpm.textContent = grossWpm;
    resAccuracy.textContent = `${accuracy}%`;
    resTime.textContent = `${elapsedSeconds}s`;
    resCorrectChars.textContent = correctChars;
    resIncorrectChars.textContent = incorrectChars;
    resTotalChars.textContent = totalChars;
    resMistakes.textContent = state.totalMistakes;

    typingScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
  }

  /* ============================== Restart ============================== */

  function attachRestartListeners() {
    restartBtn.addEventListener('click', () => {
      loadNewTest(state.duration);
      hiddenInput.focus();
    });

    restartBtnHeader.addEventListener('click', () => {
      loadNewTest(state.duration);
      hiddenInput.focus();
    });
  }

  /* ============================== Boot ============================== */

  document.addEventListener('DOMContentLoaded', init);
})();
