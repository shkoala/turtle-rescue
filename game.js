import { epilogue, gapsFor, notice, stages } from './quest.js';

const main = document.querySelector('#main');
const teacherDialog = document.querySelector('#teacher-key');
const storageKey = 'turtle-rescue-quest-v1';
let screen = 'home';

function newRun() {
  return { stage: 0, part: 0, unlocked: 0, progress: {}, started: false, finished: false };
}

function loadRun() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored?.progress && stages[stored.stage]?.parts[stored.part] && stages[stored.unlocked]) {
      return stored;
    }
  } catch {
    // The quest also works when local storage is unavailable.
  }
  return newRun();
}

let run = loadRun();

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(run));
  } catch {
    // Keep this session playable in private browsers.
  }
}

function escape(value) {
  const element = document.createElement('span');
  element.textContent = String(value);
  return element.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function current() {
  const stage = stages[run.stage];
  const part = stage.parts[run.part];
  const progress = run.progress[part.id] ??= {
    gaps: {}, choices: {}, order: [], reading: 0, readingChecked: false, planConfirmed: false, done: false,
  };
  return { stage, part, progress };
}

function stageComplete(stage) {
  return stage.parts.every(part => run.progress[part.id]?.done);
}

function openPart(stageIndex, partIndex = 0, section = 'scene') {
  run.stage = stageIndex;
  run.part = partIndex;
  run.started = true;
  screen = 'quest';
  save();
  render(section);
}

function route(onHome = false) {
  return `<nav class="route${onHome ? ' route-home' : ''}" aria-label="Quest route">
    ${onHome ? '<h2>Your route</h2>' : ''}
    <ol>${stages.map((stage, index) => {
      const active = screen === 'quest' && run.stage === index;
      const complete = stageComplete(stage);
      const state = complete ? ' complete' : '';
      const label = `<span class="stop-number">${complete ? '✓' : index + 1}</span><span class="stop-title">${stage.label}</span>`;
      if (!onHome && index <= run.unlocked) {
        return `<li class="${state}"><button type="button" data-action="scene" data-index="${index}" ${active ? 'aria-current="step"' : ''}>${label}</button></li>`;
      }
      return `<li class="unopened${state}"><span>${label}</span></li>`;
    }).join('')}</ol>
  </nav>`;
}

function imageTag(name, alt, className = '') {
  return `<img class="${className}" src="./assets/${name}.webp" alt="${escape(alt)}" decoding="async">`;
}

function renderHome() {
  const action = run.finished ? 'ending' : 'start';
  const label = run.finished ? 'View the ending' : run.started ? 'Continue the quest' : 'Start the quest';
  return `<section class="cover" aria-labelledby="cover-title">
    ${imageTag('turtle', 'A sea turtle swims through sunlit turquoise water.', 'cover-art')}
    <div class="cover-content">
      <p class="cover-kicker">English quest · A2–A2+</p>
      <h1 id="cover-title">Turtle<br>Rescue</h1>
      <p class="cover-intro">A storm has left plastic all over Turtle Beach. Guide the volunteers to the rescue centre and help protect the turtle nests.</p>
      <button class="primary cover-button" type="button" data-action="${action}">${label}</button>
    </div>
  </section>
  ${route(true)}`;
}

function renderQuest() {
  const { stage, part, progress } = current();
  return `${route()}
    <section class="scene-banner scene-${stage.id}" aria-labelledby="scene-title">
      <div class="scene-copy">
        <p class="scene-time">${stage.when}</p>
        <h1 id="scene-title" tabindex="-1">${stage.title}</h1>
      </div>
      ${imageTag(part.art ?? stage.art, part.alt ?? stage.alt, 'scene-art')}
    </section>
    <section class="activity activity-${part.type}" aria-labelledby="activity-title">
      ${renderActivity(part, progress)}
    </section>`;
}

function renderEnding() {
  return `<section class="ending" aria-labelledby="ending-title">
    ${imageTag(epilogue.art, epilogue.alt, 'ending-art')}
    <div class="ending-copy">
      <p class="eyebrow">${epilogue.when}</p>
      <h1 id="ending-title" tabindex="-1">${epilogue.title}</h1>
      <p>${epilogue.text}</p>
      <div class="chat-row ending-message">
        ${avatar('Mia')}
        <p class="bubble"><strong>Mia</strong> ${epilogue.message}</p>
      </div>
      <div class="ending-actions">
        <button type="button" class="primary" data-action="review">Review the quest</button>
        <button type="button" class="secondary" data-action="restart">Play again</button>
      </div>
    </div>
  </section>`;
}

function render(section) {
  main.innerHTML = screen === 'home' ? renderHome() : screen === 'ending' ? renderEnding() : renderQuest();
  const selectedStop = main.querySelector('.route [aria-current="step"]');
  if (selectedStop) {
    const list = selectedStop.closest('ol');
    if (list.scrollWidth > list.clientWidth) {
      list.scrollLeft = selectedStop.closest('li').offsetLeft - (list.clientWidth - selectedStop.clientWidth) / 2;
    }
  }
  if (section) {
    const target = main.querySelector(section === 'activity' ? '#activity-title' : 'h1');
    target?.focus({ preventScroll: true });
    if (section === 'activity') target?.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
  }
}

function avatar(person) {
  const names = ['Mia', 'Nina', 'Max', 'Leo', 'Alex'];
  if (!names.includes(person)) {
    return `<span class="avatar avatar-initial" aria-hidden="true">${person === 'Traffic warden' ? 'W' : 'M'}</span>`;
  }
  return `<img class="avatar" src="./assets/${person.toLowerCase()}.webp" width="44" height="44" alt="">`;
}

function selectField(field, index, progress) {
  const selected = progress.gaps[index];
  const wide = field.options.some(option => option.length > 30);
  const label = 'Complete ' + field.text.replace('{}', 'the blank');
  return `<select class="gap${wide ? ' gap-wide' : ''}" data-gap="${index}" aria-label="${escape(label)}" ${progress.done ? 'disabled' : ''}>
    <option value="" ${selected ? '' : 'selected'} disabled>${wide ? 'Choose a question' : '…'}</option>
    ${field.options.map(option => `<option value="${escape(option)}"${option === selected ? ' selected' : ''}>${escape(option)}</option>`).join('')}
  </select>`;
}

function gapLine(field, index, progress) {
  return `<p class="gap-line">${escape(field.text).replace('{}', selectField(field, index, progress))}</p>`;
}

function chatRows(messages, part, progress, dialogue = false) {
  return `<div class="thread${dialogue ? ' dialogue' : ''}">
    ${messages.map(message => {
      const content = escape(message.text).replace(/\{(\d+)\}/g, (_, index) => selectField(part.gaps[index], index, progress));
      return `<div class="chat-row ${message.person === 'Mia' || message.person === 'Mum' ? ' chat-lead' : ''}">
        ${avatar(message.person)}
        <p class="bubble"><strong>${escape(message.person)}</strong> ${content}</p>
      </div>`;
    }).join('')}
  </div>`;
}

function choices(questions, progress, startIndex = 0, locked = false) {
  return `<div class="choice-list">${questions.map((item, index) => {
    const id = startIndex + index;
    const selected = progress.choices[id];
    return `<fieldset class="choice-set" data-question="${id}">
      <legend>${escape(item.text)}</legend>
      ${item.options.map((option, ix) => `<label class="option">
        <input type="radio" name="choice-${id}" value="${ix}" data-choice="${id}" ${selected === ix ? 'checked' : ''} ${locked ? 'disabled' : ''}>
        <span>${escape(option)}</span>
      </label>`).join('')}
    </fieldset>`;
  }).join('')}</div>`;
}

function noticeReading(part, progress) {
  const index = progress.reading;
  const ready = progress.readingChecked || progress.done;
  return `<div class="reading-layout">
    <article class="notice-paper">
      <h2>Help us clean Turtle Beach!</h2>
      ${notice.map(paragraph => `<p>${paragraph}</p>`).join('')}
    </article>
    <div class="reading-question">
      <h2 id="activity-title" tabindex="-1">${part.title}</h2>
      <div class="question-count" aria-label="Question ${index + 1} of ${part.questions.length}">
        ${part.questions.map((_, item) => `<span class="${item < index || (item === index && ready) ? 'answered' : item === index ? 'current' : ''}" aria-hidden="true"></span>`).join('')}
      </div>
      <p class="count-label">Question ${index + 1} of ${part.questions.length}</p>
      ${choices([part.questions[index]], progress, index, ready)}
      ${activityEnd(part, progress)}
    </div>
  </div>`;
}

function activityHeader(part) {
  return `<header class="activity-heading">
    <h2 tabindex="-1" id="activity-title">${part.title}</h2>
    ${part.intro ? `<p>${escape(part.intro)}</p>` : ''}
  </header>`;
}

function activityEnd(part, progress) {
  let button = 'Check answers';
  let action = 'check';
  let feedback = '';
  if (progress.done) {
    action = 'next';
    const stage = stages[run.stage];
    if (run.part + 1 < stage.parts.length) button = 'Continue';
    else if (run.stage + 1 < stages.length) button = 'Next: ' + stages[run.stage + 1].label;
    else button = 'See the ending';
    feedback = part.done || 'Well done.';
  } else if (part.type === 'reading' && progress.readingChecked) {
    button = 'Next question';
    action = 'next-question';
    feedback = 'Correct.';
  } else if (part.type === 'reading') {
    button = 'Check answer';
  } else if (part.type === 'plan' && !progress.planConfirmed) {
    button = 'Send the message';
  }
  return `<div class="activity-end">
    <p class="feedback${feedback ? ' positive' : ''}" id="feedback" role="status">${escape(feedback)}</p>
    ${progress.done && part.say ? `<p class="say">${escape(part.say)}</p>` : ''}
    <button class="primary" type="button" data-action="${action}">${escape(button)}</button>
  </div>`;
}

function plan(part, progress) {
  return `<div class="plan-options">${part.routes.map(item => `<section class="plan-option">
    <h3>${escape(item.name)}</h3><p>${escape(item.detail)}</p>
  </section>`).join('')}</div>
  ${choices(part.questions, progress, 0, progress.planConfirmed || progress.done)}
  ${progress.planConfirmed ? '<p class="reply-instruction">Complete Nina’s reply with by, on or in.</p>' + chatRows(part.messages, part, progress) : ''}`;
}

const signs = {
  'diversion-left': { label: 'Yellow diversion sign with an arrow to the left', word: 'Diversion', arrow: 'left' },
  'diversion-ahead': { label: 'Yellow diversion sign with an arrow straight ahead', word: 'Diversion', arrow: 'ahead' },
  'no-left': { label: 'A black left turn arrow crossed by a red line in a red circle', arrow: 'left' },
  'no-entry': { label: 'Red circle with a white horizontal bar' },
  'speed': { label: 'Number 30 inside a red circle', word: '30' },
  'lights': { label: 'The top, red traffic light is lit' },
  'left-only': { label: 'A white arrow pointing left on a blue circle', arrow: 'left' },
  'no-parking': { label: 'Blue circle with a red border and red diagonal line' },
  'parking': { label: 'White P on a blue square, with a bus parking plate', word: 'P' },
};

function signImage(code) {
  const sign = signs[code];
  return `<div class="sign-icon sign-${code}" role="img" aria-label="${sign.label}">
    ${sign.word ? `<span class="sign-word">${sign.word}</span>` : ''}
    ${sign.arrow ? `<span class="sign-arrow arrow-${sign.arrow}"></span>` : ''}
    ${code === 'lights' ? '<span></span><span></span><span></span>' : ''}
    ${code === 'parking' ? '<small>Bus parking</small>' : ''}
  </div>`;
}

function signCards(part, progress) {
  let index = 0;
  return `<div class="sign-grid">${part.signs.map(sign => `<section class="sign-card">
    <div class="sign-picture">
      ${signImage(sign.code)}
      ${sign.code === 'no-left' ? '<div class="street-plate">Beech Street <span aria-hidden="true">→</span></div>' : ''}
    </div>
    <div class="sign-content">
      <h3>${escape(sign.context)}</h3>
      ${sign.gaps.map(field => gapLine(field, index++, progress)).join('')}
    </div>
  </section>`).join('')}</div>`;
}

function pairCards(part) {
  return `<p class="pair-instruction">Work in pairs. Take a role and practise the conversation. Open the phrases if you need help.</p>
  <div class="pair-grid">${part.roles.map(role => `<section class="role-card">
    <h3>${escape(role.name)}</h3>
    <p>${escape(role.brief)}</p>
    <details><summary>Useful phrases</summary><ul>
      ${role.lines.map(line => `<li>${escape(line)}</li>`).join('')}
    </ul></details>
  </section>`).join('')}</div>`;
}

function orderTask(part, progress) {
  return `<div class="order-layout" id="order-task">
    <div class="order-bank"><h3>Actions</h3>${part.items.map(item => {
      const used = progress.order.includes(item.letter);
      return `<button class="order-card" type="button" data-action="order-add" data-letter="${item.letter}" ${used || progress.done ? 'disabled' : ''}>
        <span class="order-letter">${item.letter}</span><span>${escape(item.text)}</span>
      </button>`;
    }).join('')}</div>
    <div class="order-answer"><h3>Your route</h3>
      ${progress.order.length ? `<ol>${progress.order.map(letter => {
        const item = part.items.find(action => action.letter === letter);
        return `<li><span>${escape(item.text)}</span>${progress.done ? '' : `<button type="button" class="remove-step" data-action="order-remove" data-letter="${letter}" aria-label="Remove action ${letter}">×</button>`}</li>`;
      }).join('')}</ol>` : '<p class="order-empty">Tap the first action.</p>'}
    </div>
  </div>`;
}

function renderActivity(part, progress) {
  if (part.type === 'reading') return noticeReading(part, progress);
  let body;
  switch (part.type) {
    case 'chat':
      body = chatRows(part.messages, part, progress);
      break;
    case 'plan':
      body = plan(part, progress);
      break;
    case 'dialogue':
      body = chatRows(part.dialogues, part, progress, true);
      break;
    case 'gaps':
      body = `<div class="gaps">${part.gaps.map((field, index) => gapLine(field, index, progress)).join('')}</div>`;
      break;
    case 'signs':
      body = signCards(part, progress);
      break;
    case 'pair':
      body = pairCards(part) + choices(part.questions, progress, 0, progress.done);
      break;
    case 'order':
      body = orderTask(part, progress);
      break;
    case 'briefing': {
      let index = 0;
      body = `<div class="briefing-grid">${part.groups.map(group => `<section class="briefing-card">
        <h3>${group.title}</h3><p class="modal-pair">${group.words}</p>
        ${group.gaps.map(field => gapLine(field, index++, progress)).join('')}
      </section>`).join('')}</div>`;
      break;
    }
    default:
      body = choices(part.questions, progress, 0, progress.done);
  }
  return activityHeader(part) + body + activityEnd(part, progress);
}

function report(message, success = false) {
  const node = document.querySelector('#feedback');
  node.textContent = message;
  node.className = 'feedback ' + (success ? 'positive' : 'try-again');
}

function clearMark(control) {
  control?.classList.remove('is-correct', 'is-wrong');
  control?.removeAttribute('aria-invalid');
}

function mark(control, valid) {
  clearMark(control);
  if (!control) return;
  control.classList.add(valid ? 'is-correct' : 'is-wrong');
  if (!valid) control.setAttribute('aria-invalid', 'true');
}

function validateChoices(items, progress, startIndex = 0) {
  let hint = '';
  for (const [i, question] of items.entries()) {
    const index = startIndex + i;
    const choice = progress.choices[index];
    const correct = choice === question.answer;
    mark(main.querySelector(`[data-question="${index}"]`), correct);
    if (!hint && !correct) hint = choice === undefined ? 'Choose an answer for each question.' : question.hint;
  }
  return hint;
}

function validateGaps(fields, progress) {
  let hint = '';
  for (const [index, field] of fields.entries()) {
    const choice = progress.gaps[index];
    const correct = choice === field.answer;
    mark(main.querySelector(`[data-gap="${index}"]`), correct);
    if (!hint && !correct) hint = choice === undefined ? 'Complete each blank first.' : field.hint;
  }
  return hint;
}

function refreshActivity(part, progress, focus = 'action') {
  main.querySelector('.activity').innerHTML = renderActivity(part, progress);
  if (focus === 'title') main.querySelector('#activity-title')?.focus({ preventScroll: true });
  else main.querySelector('.activity-end button')?.focus({ preventScroll: true });
}

function completePart(part, progress) {
  progress.done = true;
  if (stageComplete(stages[run.stage])) {
    run.unlocked = Math.max(run.unlocked, Math.min(run.stage + 1, stages.length - 1));
  }
  save();
  main.querySelector('.route').outerHTML = route();
  refreshActivity(part, progress);
}

function check() {
  const { part, progress } = current();
  if (part.type === 'reading') {
    const hint = validateChoices([part.questions[progress.reading]], progress, progress.reading);
    if (hint) return report(hint);
    if (progress.reading === part.questions.length - 1) return completePart(part, progress);
    progress.readingChecked = true;
    save();
    return refreshActivity(part, progress);
  }
  if (part.type === 'plan' && !progress.planConfirmed) {
    const hint = validateChoices(part.questions, progress);
    if (hint) return report(hint);
    progress.planConfirmed = true;
    save();
    refreshActivity(part, progress);
    main.querySelector('[data-gap="0"]').focus();
    return;
  }
  if (part.type === 'order') {
    if (progress.order.join() !== part.order.join()) {
      return report(progress.order.length < part.order.length ? 'Put all four actions in order first.' : part.hint);
    }
    return completePart(part, progress);
  }
  const gapHint = validateGaps(gapsFor(part), progress);
  const choiceHint = validateChoices(part.questions ?? [], progress);
  if (gapHint || choiceHint) return report(gapHint || choiceHint);
  return completePart(part, progress);
}

function nextPart() {
  if (run.part + 1 < stages[run.stage].parts.length) {
    return openPart(run.stage, run.part + 1, 'activity');
  }
  if (run.stage + 1 < stages.length) {
    return openPart(run.stage + 1);
  }
  run.finished = true;
  save();
  screen = 'ending';
  render('scene');
}

function changeOrder(letter, remove) {
  const { part, progress } = current();
  if (remove) progress.order = progress.order.filter(item => item !== letter);
  else if (!progress.order.includes(letter)) progress.order.push(letter);
  save();
  main.querySelector('#order-task').outerHTML = orderTask(part, progress);
  const next = main.querySelector('.order-card:not(:disabled)') ?? main.querySelector('[data-action="check"]');
  next?.focus({ preventScroll: true });
}

function makeKey() {
  const teacherNotes = {
    chat: 'The walking option is from the station to the centre. Alex’s walk to the station is a separate journey. Model: “We shouldn’t walk because we’ll arrive at 10.10. The ranger is meeting us at ten.”',
    detour: 'After the diversion: go past the supermarket, turn left at the traffic lights and look for the station on the right, opposite the sports centre.',
    cafe: 'Put learners in pairs and let each choose a role. You can open the phrases for support. The usual bus bay is closed, so Leo asks about a place for the bus.',
    beach: 'Model: “We can pick up the bottle. Leo, you mustn’t step over the rope. We should tell the ranger about the bag.”',
  };
  document.querySelector('#teacher-content').innerHTML = `<p>For A2–A2+ learners. Ask students to say each answer before checking it. The café conversation and final reply can be done aloud in pairs.</p>
    ${stages.map(stage => `<details class="key-stage">
      <summary>${stage.label}</summary>
      ${stage.parts.map(part => `<h3>${part.title}</h3>
        <ol>${[
          ...gapsFor(part).map(item => item.text.includes('{}') ? item.text.replace('{}', item.answer) : item.answer),
          ...(part.questions ?? []).map(item => item.options[item.answer]),
          ...(part.order ?? []).map(letter => letter + ' · ' + part.items.find(item => item.letter === letter).text),
        ].map(item => `<li>${escape(item)}</li>`).join('')}</ol>`).join('')}
      ${teacherNotes[stage.id] ? `<p>${escape(teacherNotes[stage.id])}</p>` : ''}
    </details>`).join('')}`;
}

document.addEventListener('change', event => {
  if (screen !== 'quest') return;
  const { progress } = current();
  if ('gap' in event.target.dataset) {
    progress.gaps[event.target.dataset.gap] = event.target.value;
    clearMark(event.target);
  } else if ('choice' in event.target.dataset) {
    progress.choices[event.target.dataset.choice] = Number(event.target.value);
    clearMark(event.target.closest('fieldset'));
  } else {
    return;
  }
  save();
});

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, index, letter } = button.dataset;
  switch (action) {
    case 'home':
      screen = 'home';
      render('scene');
      break;
    case 'start':
      openPart(run.stage, run.part);
      break;
    case 'scene':
      openPart(Number(index));
      break;
    case 'check':
      check();
      break;
    case 'next-question': {
      const { part, progress } = current();
      progress.reading++;
      progress.readingChecked = false;
      save();
      refreshActivity(part, progress, 'title');
      break;
    }
    case 'next':
      nextPart();
      break;
    case 'order-add':
      changeOrder(letter, false);
      break;
    case 'order-remove':
      changeOrder(letter, true);
      break;
    case 'ending':
      screen = 'ending';
      render('scene');
      break;
    case 'review':
      openPart(0);
      break;
    case 'restart':
      run = newRun();
      openPart(0);
      break;
    case 'teacher':
      if (!document.querySelector('#teacher-content').childElementCount) makeKey();
      teacherDialog.showModal();
      break;
  }
});

render();
