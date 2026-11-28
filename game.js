import { chapters, collections, notice, scenes } from './quest.js?v=cafe-tyre';

const main = document.querySelector('#main');
const route = document.querySelector('#route');
const noticeDialog = document.querySelector('#notice');
const teacherDialog = document.querySelector('#teacher-key');
const storage = 'turtle-rescue-adventure-3';
const previousStorage = 'turtle-rescue-adventure-2';
const priorStorage = 'turtle-rescue-adventure-1';
const washoutChapter = chapters.findIndex(chapter => chapter.name === 'The washout');
const stationChapter = chapters.findIndex(chapter => chapter.name === 'The station');
const cafeChapter = chapters.findIndex(chapter => chapter.name === 'Pine Café');
const crossingChapter = chapters.findIndex(chapter => chapter.name === 'The crossing');
const portraits = new Set(['Mia', 'Leo', 'Nina', 'Alex', 'Max']);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const warmed = new Map();

const signDescriptions = {
  'diversion-left': ['Yellow diversion sign with an arrow to the left', 'Diversion', 'left'],
  'diversion-ahead': ['Yellow diversion sign with an arrow straight ahead', 'Diversion', 'ahead'],
  'left-only': ['A white arrow pointing left on blue', '', 'left'],
  'no-left': ['A left turn arrow crossed by a red line', '', 'bent'],
  right: ['Beech Street is to the right', 'Beech Street', 'right'],
  speed: ['Number 30 inside a red circle', '30'],
  'no-entry': ['Red circle with a white horizontal bar'],
  lights: ['Traffic lights with the top, red light on'],
  green: ['Traffic lights with the bottom, green light on'],
};
const landmarkPosts = {
  'diversion-left': { x: 42, y: 69, scale: .9 },
};

const icon = (name, className = '') => '<span class="token ' + className + ' token-' + name + '" aria-hidden="true"></span>';

function emptyTask(id = '') {
  return { id, order: [], solved: false };
}

function cleanRun() {
  return {
    chapter: 0, index: 0, unlocked: 0, started: false, finished: false, supplies: false,
    found: { friends: [], litter: [] }, task: emptyTask(),
  };
}

function taskSize(beat) {
  return beat.type === 'tiles' ? beat.tokens.length : beat.lines.length;
}

function matchesTask(beat, order) {
  return order.length === taskSize(beat) && order.every((token, index) =>
    beat.type === 'tiles' ? beat.tokens[token] === beat.tokens[index] : token === index);
}

function resumeTask(beat, state) {
  if (state?.id !== beat.id) return emptyTask(beat.id);
  const { order, solved } = state;
  const length = taskSize(beat);
  if (!Array.isArray(order) || new Set(order).size !== order.length
    || !order.every(line => Number.isInteger(line) && line >= 0 && line < length)) {
    return emptyTask(beat.id);
  }
  return { id: beat.id, order, solved: solved === true && matchesTask(beat, order) };
}

function updateOldProgress(saved) {
  let { chapter, index, unlocked } = saved;
  const found = { ...saved.found };
  if (chapter === washoutChapter) index = Math.min(index, 6);
  if (chapter === stationChapter) {
    index = Math.min(index, 1);
    found.friends = [];
  }
  if (chapter === cafeChapter - 1 && index >= 16) {
    chapter = cafeChapter;
    unlocked = Math.max(unlocked, cafeChapter);
    index = 0;
  } else if (chapter === cafeChapter && index >= 3) {
    index = saved.supplies ? (index >= 12 ? chapters[cafeChapter].steps.length - 1 : 3) : 2;
  } else if (chapter === crossingChapter) {
    index = index >= 6 ? index - 3 : Math.max(0, index - 4);
  }
  const { dialogue, ...old } = saved;
  const warden = chapters[washoutChapter].steps.at(-1);
  return {
    ...cleanRun(), ...old, chapter, index, unlocked, found,
    task: resumeTask(warden, { id: warden.id, ...dialogue }),
  };
}

function hasProgress(saved) {
  return saved && Number.isInteger(saved.chapter) && chapters[saved.chapter] && chapters[saved.unlocked]
    && Number.isInteger(saved.index) && saved.index >= 0
    && Array.isArray(saved.found?.friends) && Array.isArray(saved.found?.litter);
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storage));
    if (hasProgress(saved) && chapters[saved.chapter].steps[saved.index]) return saved;
    const previous = JSON.parse(localStorage.getItem(previousStorage));
    if (hasProgress(previous)) {
      const restored = updateOldProgress(previous);
      if (chapters[restored.chapter].steps[restored.index]) return restored;
    }
    const prior = JSON.parse(localStorage.getItem(priorStorage));
    if (prior && Number.isInteger(prior.chapter) && prior.chapter >= 0 && prior.chapter <= 6
      && Number.isInteger(prior.unlocked) && prior.unlocked >= prior.chapter && prior.unlocked <= 6) {
      // Earlier players who were on the bus resume at the new station scene.
      const chapter = prior.chapter > 3 ? prior.chapter + 1 : prior.chapter;
      const index = prior.chapter !== 3 && Number.isInteger(prior.index) && prior.index >= 0 ? prior.index : 0;
      const unlocked = prior.unlocked > 3 ? prior.unlocked + 1 : prior.unlocked;
      const restored = updateOldProgress({
        ...cleanRun(), chapter, index, unlocked,
        started: Boolean(prior.started), finished: Boolean(prior.finished), supplies: Boolean(prior.supplies),
        found: { friends: [], litter: Array.isArray(prior.picked) ? prior.picked : [] },
      });
      if (chapters[restored.chapter].steps[restored.index]) return restored;
    }
  } catch {
    // Start a new run if saved data cannot be read.
  }
  return cleanRun();
}

let run = load();
let screen = 'cover';
let renderedShot = '';
let pending = 0;
let locked = false;
let target = null;
let motion = !reducedMotion.matches;

function save() {
  try {
    localStorage.setItem(storage, JSON.stringify(run));
  } catch {
    // The game still runs for the current session.
  }
}

function escape(text) {
  return String(text).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function asset(name, extra = '') {
  return '<img src="./assets/' + name + '.webp" alt="" ' + extra + '>';
}

function actorArt(scene, person) {
  const pose = scene.poses?.[person];
  return 'actor-' + person.toLowerCase() + (pose ? '-' + pose : '');
}

function warm(name) {
  if (warmed.has(name)) return;
  const picture = new Image();
  picture.decoding = 'async';
  picture.src = './assets/' + name + '.webp';
  warmed.set(name, picture);
}

function warmUpcoming() {
  const beats = target ? target.item.prompts.slice(target.index, target.index + 4)
    : chapters[run.chapter].steps.slice(run.index, run.index + 4);
  if (beats.length < 4 && chapters[run.chapter + 1]) beats.push(chapters[run.chapter + 1].steps[0]);
  for (const beat of beats) {
    const scene = scenes[beat.scene];
    warm(scene.art);
    scene.cast.forEach(person => warm(actorArt(scene, person)));
    if (beat.scene === 'station') warm('actor-max-carry');
    if (beat.collection === 'friends') {
      collections.friends.forEach(friend => warm(scenes[friend.prompts[0].scene].art));
    }
    if (beat.effect === 'pickup') {
      warm('car-outside');
      warm('car-steps');
    }
    if (scene.road?.start) warm('bus-rear');
    if (beat.effect === 'burst') ['bus', 'wheel', 'actor-mia', 'actor-leo'].forEach(warm);
    if (beat.effect === 'hatch') warm('turtle-walk');
  }
}

function button(label, action, className = 'primary', extra = '') {
  return '<button type="button" class="' + className + '" data-action="' + action + '" ' + extra + '>' + escape(label) + '</button>';
}

function chapterBeat() {
  return chapters[run.chapter].steps[run.index];
}

function currentBeat() {
  return target ? target.item.prompts[target.index] : chapterBeat();
}

function showRoute() {
  if (screen === 'cover' || screen === 'ending') {
    route.innerHTML = '';
    return;
  }
  route.innerHTML = '<ol aria-label="Quest route" style="--stops:' + chapters.length + '">' + chapters.map((chapter, index) => {
    const label = '<span class="route-dot">' + (index < run.unlocked ? '✓' : index + 1) + '</span><span class="route-name">' + chapter.name + '</span>';
    const description = (index + 1) + '. ' + chapter.name;
    const current = index === run.chapter ? ' aria-current="step"' : '';
    const control = index <= run.unlocked
      ? '<button type="button" data-action="chapter" data-value="' + index + '" aria-label="' + description + '"' + current + '>' + label + '</button>'
      : '<span class="route-locked" aria-label="' + description + '">' + label + '</span>';
    return '<li>' + control + '</li>';
  }).join('') + '</ol>';
  const active = route.querySelector('[aria-current]');
  const list = route.querySelector('ol');
  if (active && list.scrollWidth > list.clientWidth) {
    list.scrollLeft = active.closest('li').offsetLeft - (list.clientWidth - active.clientWidth) / 2;
  }
}

function roadPosition([x, y, scale, tilt]) {
  return { left: x + '%', top: y + '%', transform: 'translate(-50%, -100%) scale(' + scale + ') rotate(' + tilt + 'deg)' };
}

function roadWorld(scene) {
  const start = scene.road.start && roadPosition(scene.road.start);
  const bus = start
    ? '<div class="road-bus" aria-hidden="true" style="left:' + start.left + ';top:' + start.top
      + ';transform:' + start.transform + '">' + asset('bus-rear') + '</div>'
    : '';
  return '<div class="world-back road-world"><div class="road-plane">'
    + asset(scene.art, 'class="road-image"') + '<div class="scene-light" aria-hidden="true"></div>'
    + bus + '<div id="road-signs"></div></div></div>';
}

function stationBackdrop(scene) {
  return '<div class="rail-picture"><div class="road-plane">' + asset(scene.art, 'class="road-image"')
    + '<span class="railway-name">PEBBLE BAY</span>'
    + '<span class="station-clock"><i></i><i></i></span></div></div>';
}

function carArrival(scene) {
  const walkers = ['mia', 'leo'].map(person => '<div class="car-walker car-walker-' + person + '">'
    + '<span class="car-stride"></span><span class="car-step-in"></span></div>').join('');
  return '<div class="world-back" aria-hidden="true">' + asset(scene.art, 'class="landscape car-inside"')
    + '<div class="car-pickup"><div class="car-picture">' + asset('car-outside')
    + walkers + asset('car-outside', 'class="car-door"') + '</div></div><div class="scene-light"></div></div>';
}

function filmWorld(beat, scene) {
  const still = asset(scene.art, 'class="journey-media"');
  const movie = beat.type === 'clip' ? '<video class="journey-media scene-video" autoplay muted playsinline'
    + ' preload="auto" poster="./assets/' + scene.art + '.webp" src="./assets/' + scene.video + '.mp4"></video>' : '';
  return '<div class="world-back journey-world" aria-hidden="true">' + still + movie + '<div class="scene-light"></div></div>';
}

function flatTyre(scene) {
  const riders = ['mia', 'leo'].map(person =>
    '<span class="rider rider-' + person + '">' + asset('actor-' + person) + '</span>').join('');
  return '<div class="world-back" aria-hidden="true">' + asset(scene.art, 'class="landscape"')
    + '<div class="scene-light"></div><div class="speed-lines"></div>'
    + '<div class="vehicle vehicle-burst"><div class="vehicle-body">'
    + asset('bus', 'class="bus-art"') + riders
    + '<span class="bus-tyre tyre-back"></span><span class="bus-tyre tyre-front"></span>'
    + '</div><span class="dust"></span></div><span class="burst-call">POP!</span></div>';
}

function world(beat, scene) {
  if (scene.road) return roadWorld(scene);
  if (beat.effect === 'pickup') return carArrival(scene);
  if (beat.effect === 'burst') return flatTyre(scene);
  if (scene.video) return filmWorld(beat, scene);
  const characters = scene.cast.map(person =>
    asset(actorArt(scene, person), 'class="actor actor-' + person.toLowerCase() + '"')
  ).join('');
  const hatch = beat.effect === 'hatch' ? '<div class="hatch-track">' + [1, 2, 3].map(index =>
    asset('turtle-walk', 'class="hatchling hatchling-' + index + '"')).join('') + '</div>' : '';
  const backdrop = beat.scene === 'station' ? stationBackdrop(scene) : asset(scene.art, 'class="landscape"');
  return '<div class="world-back" aria-hidden="true">' + backdrop
    + '<div class="scene-light"></div>' + characters + hatch + '</div>';
}

function portrait(name) {
  return portraits.has(name)
    ? asset(name.toLowerCase(), 'class="portrait"')
    : '<span class="portrait portrait-letter" aria-hidden="true">' + (name === 'Traffic warden' ? 'W' : name[0]) + '</span>';
}

function title(beat, scene) {
  const caption = '<span class="scene-time">' + escape(beat.time ?? scene.time) + '</span>'
    + '<h1 tabindex="-1" id="location-title">' + escape(scene.place) + '</h1>';
  return '<div class="location">' + caption + '</div>'
    + (run.supplies && run.chapter >= cafeChapter ? '<span class="kit">' + icon('supplies') + 'Gloves &amp; bags</span>' : '');
}

function propSign(sign, post) {
  const [description, word, direction] = signDescriptions[sign];
  return '<div class="mounted-sign" role="img" aria-label="' + escape(description)
    + '" style="--sign-x:' + post.x + '%;--sign-y:' + post.y + '%;--sign-scale:' + post.scale + '">'
    + '<div class="sign sign-' + sign + '">'
    + (word ? '<span>' + word + '</span>' : '')
    + (direction ? '<i class="arrow arrow-' + direction + '"></i>' : '')
    + (sign === 'lights' || sign === 'green' ? '<i></i><i></i><i></i>' : '')
    + '</div></div>';
}

function hotspot(marker, index, mode, visited = false, person = '') {
  const label = marker.label;
  return '<button type="button" class="hotspot' + (visited ? ' visited' : '') + (person ? ' friend-' + person : '') + '" data-action="' + mode
    + '" data-value="' + index + '" style="--x:' + marker.x + '%;--y:' + marker.y + '%"'
    + (visited ? ' disabled' : '') + '><span class="hotspot-pin">'
    + (marker.kind ? icon(marker.kind) : '<i></i>') + '</span><span class="hotspot-name">'
    + escape(label) + '</span></button>';
}

function sceneObjects(beat) {
  if (beat.sign) return propSign(beat.sign, landmarkPosts[beat.sign]);
  if (beat.type === 'find') {
    return '<div class="hotspots">' + beat.spots.map((marker, index) =>
      hotspot(marker, index, 'spot', beat.visited?.includes(index))).join('') + '</div>';
  }
  if (beat.type === 'search') {
    const collection = beat.collection;
    return '<div class="hotspots">' + collections[collection].map((item, index) =>
      run.found[collection].includes(item.id) ? '' : hotspot(item.spot, index, 'investigate', false,
        collection === 'friends' ? item.id : '')).join('') + '</div>';
  }
  if (beat.scene === 'cleanup') {
    return '<div class="hotspots">' + collections.litter.map(item => {
      if (run.found.litter.includes(item.id)) return '';
      return '<div class="loose-litter" aria-hidden="true" style="--x:' + item.spot.x + '%;--y:' + item.spot.y + '%">'
        + icon(item.spot.kind) + '</div>';
    }).join('') + '</div>';
  }
  return '';
}

function formattedLine(text, answer) {
  return escape(text).replace('{}', answer
    ? '<strong class="word-filled">' + escape(answer) + '</strong>'
    : '<span class="word-gap" aria-label="blank">…</span>');
}

function noticePaper() {
  return '<article class="paper"><h2>Help us clean Turtle Beach!</h2>' + notice.map(p => '<p>' + p + '</p>').join('') + '</article>';
}

function chatHistory(chapter, include) {
  const messages = chapters[chapter].steps.slice(0, run.index).filter(include);
  if (!messages.length) return '';
  return '<div class="chat-history" aria-label="Earlier messages">' + messages.map(item =>
    '<div class="chat-entry">' + portrait(item.speaker) + '<p><strong>' + escape(item.speaker)
    + '</strong>' + formattedLine(item.text, item.type === 'tiles' ? item.answer : item.options?.[item.answer])
    + '</p></div>').join('') + '</div>';
}

function routeCards() {
  return '<div class="route-cards"><p><strong>Walk from the station</strong>9.25 a.m. · 45 minutes</p>'
    + '<p><strong>Volunteer bus</strong>9.30 a.m. · About 20 minutes with the café stop</p></div>';
}

function markerChoices(beat) {
  const members = collections[beat.collection];
  const markers = members ? members.map(item => item.spot) : beat.spots;
  return '<div class="spot-shortcuts">' + markers.map((item, index) => {
    const used = members ? run.found[beat.collection].includes(members[index].id) : beat.visited?.includes(index);
    const action = beat.type === 'search' ? 'investigate' : 'spot';
    return button(item.label, action, 'choice-button' + (used ? ' is-correct' : ''),
      'data-value="' + index + '"' + (used ? ' disabled' : ''));
  }).join('') + '</div>';
}

function dialogueCards(beat) {
  const { order, solved } = run.task;
  const card = (index, position) => {
    const { speaker, text } = beat.lines[index];
    const className = 'dialogue-line' + (speaker === 'Mum' ? ' mum-line' : '');
    const content = '<span class="line-position" aria-hidden="true">' + (position || '+') + '</span>'
      + '<span class="line-content">' + (speaker ? '<strong>' + escape(speaker) + '</strong>' : '') + escape(text) + '</span>';
    const label = (position ? 'Return line ' + position + '. ' : 'Add line. ') + (speaker ? speaker + '. ' : '') + text;
    const moves = position && !solved ? '<div class="dialogue-moves">'
      + button('↑', 'dialogue-up', 'line-arrow', 'aria-label="Move line ' + position + ' up"' + (position === 1 ? ' disabled' : ''))
      + button('↓', 'dialogue-down', 'line-arrow', 'aria-label="Move line ' + position + ' down"' + (position === order.length ? ' disabled' : ''))
      + '</div>' : '';
    return '<li data-line="' + index + '">' + (solved ? '<div class="' + className + '">' + content + '</div>'
      : '<button type="button" data-action="dialogue-line" data-value="' + index + '" class="' + className
      + '" aria-label="' + escape(label) + '">' + content + '</button>') + moves + '</li>';
  };
  const selected = order.length ? '<ol class="dialogue-selected' + (solved ? '' : ' dialogue-editable') + '" aria-label="Your dialogue" role="list">'
    + order.map((line, index) => card(line, index + 1)).join('') + '</ol>' : '';
  const remaining = beat.shuffled.filter(line => !order.includes(line));
  const bank = remaining.length ? '<ul class="dialogue-bank" aria-label="Lines to add" role="list">'
    + remaining.map(line => card(line, 0)).join('') + '</ul>' : '';
  return selected + bank;
}

function dialogueButtons(beat) {
  const { order, solved } = run.task;
  if (solved) return button(beat.next, 'next');
  return button('Check order', 'dialogue-check', 'primary', order.length < beat.lines.length ? 'disabled' : '')
    + button('Start over', 'dialogue-reset', 'text-button', order.length ? '' : 'disabled');
}

function dialogueCount(beat) {
  return run.task.order.length + ' of ' + beat.lines.length + (beat.id === 'warden' ? ' lines' : ' steps');
}

function renderDialogue(beat) {
  const solved = run.task.solved;
  return '<div class="speech dialogue-task">'
    + '<p class="spoken" id="spoken" tabindex="-1">' + escape(beat.text) + '</p>'
    + '<p class="dialogue-help" id="dialogue-help"' + (solved ? ' hidden' : '')
    + '>Tap in order. Use the arrows to move a card. Tap it again to put it back.</p>'
    + '<div id="dialogue-board" class="dialogue-board" role="region" aria-label="Dialogue lines" tabindex="0">'
    + dialogueCards(beat) + '</div><p class="feedback' + (solved ? ' success' : '') + '" id="feedback" role="status">'
    + (solved ? 'That’s the right order.' : '') + '</p>'
    + '<div class="dialogue-actions"><span id="dialogue-count" role="status">' + dialogueCount(beat) + '</span>'
    + '<div id="dialogue-buttons">' + dialogueButtons(beat) + '</div></div></div>';
}

function tileGuess(beat) {
  const selected = run.task.order.map(index => beat.tokens[index]);
  if (!beat.letters) return selected.join(' ');
  const letters = selected.join('');
  let offset = 0;
  return beat.answer.split(' ').map(word => {
    const part = letters.slice(offset, offset + word.length);
    offset += word.length;
    return part;
  }).join(' ').trim();
}

function tileCards(beat) {
  const { order, solved } = run.task;
  if (solved) return button('Continue', 'next');
  const shuffled = beat.tokens.map((_, index) => index);
  let seed = beat.id.length;
  for (let end = shuffled.length - 1; end > 0; end--) {
    seed = (seed * 73 + 41) % 997;
    const other = seed % (end + 1);
    [shuffled[end], shuffled[other]] = [shuffled[other], shuffled[end]];
  }
  if (matchesTask(beat, shuffled)) shuffled.push(shuffled.shift());
  const card = (index, selected) => button(beat.tokens[index], 'tile',
    'tile' + (selected ? ' tile-selected' : ''), 'data-value="' + index + '" aria-pressed="' + selected + '"');
  const unchosen = shuffled.filter(index => !order.includes(index));
  const row = order.length ? '<div class="tile-row tile-answer" aria-label="Your answer">'
    + order.map(index => card(index, true)).join('') + '</div>' : '';
  return row + '<div class="tile-row" aria-label="Available tiles">' + unchosen.map(index => card(index, false)).join('') + '</div>'
    + '<div class="tile-actions">' + button('Check', 'tile-check', 'primary', unchosen.length ? 'disabled' : '')
    + button('Start over', 'tile-reset', 'text-button', order.length ? '' : 'disabled') + '</div>';
}

function speakerLine(beat) {
  return '<div class="speaker">' + portrait(beat.speaker) + '<strong>' + escape(beat.speaker) + '</strong>'
    + (target ? button(target.collection === 'friends' ? 'Back to the station' : 'Back to the beach', 'cancel-search', 'text-button') : '')
    + '</div>';
}

function renderTiles(beat) {
  return (beat.scene === 'cafe' ? chatHistory(cafeChapter, item => item.type === 'tiles') : '')
    + '<div class="speech tile-task' + (run.task.solved ? ' tile-solved' : '') + '">' + speakerLine(beat)
    + '<p id="spoken" class="spoken" tabindex="-1">' + formattedLine(beat.text, tileGuess(beat)) + '</p>'
    + '<p class="tile-help" id="tile-help"' + (run.task.solved ? ' hidden' : '') + '>Put the '
    + (beat.letters ? 'letters' : 'words') + ' in order.</p>'
    + '<p class="feedback" id="feedback" role="status"></p>'
    + '<div id="tile-controls">' + tileCards(beat) + '</div></div>';
}

function renderConsole(beat) {
  if (beat.type === 'order') return renderDialogue(beat);
  if (beat.type === 'tiles') return renderTiles(beat);
  let action = '';
  let line = formattedLine(beat.text);
  if (beat.type === 'pick') {
    const compact = beat.options.every(option => option.length <= 20);
    action = (beat.routes ? routeCards() : '') + '<div class="choices' + (compact ? ' choices-short' : '') + '" aria-label="Choose your reply">'
      + beat.options.map((reply, index) => button(reply, 'answer', 'choice-button', 'data-value="' + index + '"')).join('') + '</div>';
  } else if (beat.type === 'select') {
    const select = '<select id="word-select" aria-label="Choose the missing word"><option value="" selected disabled>Choose</option>'
      + beat.options.map((option, index) => '<option value="' + index + '">' + escape(option) + '</option>').join('') + '</select>';
    line = escape(beat.text).replace('{}', select);
  } else if (beat.type === 'input') {
    const input = '<input name="word" id="word-input" required maxlength="30" autocomplete="off" spellcheck="false" aria-label="Missing word">';
    line = escape(beat.text).replace('{}', input);
    action = '<button type="submit" form="word-form" class="primary">Check</button>';
  } else if (beat.type === 'find' || beat.type === 'search') {
    action = markerChoices(beat);
    if (beat.type === 'search') {
      action += '<ul class="collect-status">' + collections[beat.collection].map(item => {
        const found = run.found[beat.collection].includes(item.id);
        return '<li class="' + (found ? 'found' : '') + '">' + escape(found ? item.done : item.spot.label) + '</li>';
      }).join('') + '</ul>';
    }
  } else {
    action = button(beat.next, 'next', 'primary' + (beat.type === 'clip' ? ' play-next' : ''));
    if (beat.effect === 'burst' || beat.effect === 'hatch' || scenes[beat.scene].video) {
      action = '<div class="clip-controls">' + action + button('Replay', 'replay', 'text-button replay') + '</div>';
    }
  }
  if (beat.effect === 'pickup') action += button('Replay', 'replay', 'text-button replay car-replay');
  const chat = beat.scene === 'phone';
  const sentence = '<p class="spoken" id="spoken" tabindex="-1">' + line + '</p>';
  return (chat ? '<header class="phone-head"><strong>Pebble Bay volunteers</strong><span>Friday evening</span></header>'
    + chatHistory(1, item => !item.routes) : '')
    + '<div class="speech">'
    + speakerLine(beat)
    + (beat.type === 'input' ? '<form id="word-form">' + sentence + '</form>' : sentence)
    + (beat.reading ? button('See the notice', 'notice', 'text-button see-notice') : '')
    + '<p class="feedback" id="feedback" role="status"></p>'
    + action + '</div>';
}

function play() {
  warmUpcoming();
  const beat = currentBeat();
  if (beat.type === 'order' || beat.type === 'tiles') run.task = resumeTask(beat, run.task);
  const scene = scenes[beat.scene];
  const shot = [beat.scene, beat.effect ?? '', scene.video && beat.type === 'clip' ? 'film' : ''].join('/');
  const changed = shot !== renderedShot;
  if (changed) {
    main.innerHTML = '<section class="game-stage" id="stage"><div class="view" id="view">'
      + world(beat, scene) + '<div id="scene-ui"></div></div><div id="notice-panel"></div>'
      + '<div class="console" id="console"></div></section>';
    renderedShot = shot;
  }
  const stage = main.querySelector('#stage');
  stage.className = 'game-stage scene-' + beat.scene + (beat.notice ? ' notice-open' : '')
    + (beat.effect ? ' effect-' + beat.effect : '') + (scene.video ? ' journey-stage' : '')
    + (scene.road ? ' has-road' : '')
    + (beat.type === 'order' ? ' dialogue-stage' : '')
    + (beat.visited ? ' crossing-' + beat.visited.length : '')
    + (target ? ' searching-' + target.item.id : '');
  main.querySelector('#scene-ui').innerHTML = title(beat, scene) + sceneObjects(beat);
  if (scene.road) {
    main.querySelector('#road-signs').innerHTML = scene.road.posts.map(post =>
      propSign(post.sign === 'signal' ? beat.signal : post.sign, post)).join('');
  }
  main.querySelector('#notice-panel').innerHTML = beat.notice ? noticePaper() : '';
  const consolePanel = main.querySelector('#console');
  consolePanel.className = 'console' + (beat.scene === 'phone' ? ' phone' : '');
  consolePanel.innerHTML = renderConsole(beat);
  const history = consolePanel.querySelector('.chat-history');
  if (history) history.scrollTop = history.scrollHeight;
  const activeActor = beat.speaker && main.querySelector('.actor-' + escape(beat.speaker).toLowerCase().split(' ')[0]);
  main.querySelectorAll('.actor').forEach(actor => actor.classList.toggle('speaking', activeActor === actor));
  if (beat.scene === 'station') {
    const max = main.querySelector('.actor-max');
    const carry = run.found.friends.includes('max') || target?.item.id === 'max';
    const src = './assets/actor-max' + (carry ? '-carry' : '') + '.webp';
    if (max.getAttribute('src') !== src) max.src = src;
  }
  if (beat.type === 'clip' && motion) {
    const next = consolePanel.querySelector('.play-next');
    next.setAttribute('disabled', '');
    const finish = () => {
      if (!next.isConnected) return;
      window.clearTimeout(pending);
      pending = 0;
      next.removeAttribute('disabled');
      stage.classList.remove('film-playing');
      if (document.activeElement === stage.querySelector('#location-title')) {
        stage.querySelector('#spoken').focus({ preventScroll: true });
      }
    };
    const film = stage.querySelector('.scene-video');
    if (film) {
      stage.classList.add('film-playing');
      film.addEventListener('ended', finish, { once: true });
      film.addEventListener('error', finish, { once: true });
    }
    pending = window.setTimeout(finish, beat.duration + (film ? 1800 : 0));
  } else {
    stage.querySelector('.scene-video')?.pause();
  }
  if (beat.effect === 'pickup' && changed && motion) {
    stage.classList.add('boarding-car');
    pending = window.setTimeout(finishPickup, beat.duration);
  }
  return changed;
}

function finishPickup() {
  const stage = main.querySelector('.boarding-car');
  if (!stage) return;
  window.clearTimeout(pending);
  pending = 0;
  stage.classList.remove('boarding-car');
  if (document.activeElement === stage.querySelector('#location-title')) {
    stage.querySelector('#spoken').focus({ preventScroll: true });
  }
}

function cover() {
  const label = run.finished ? 'See the ending' : run.started ? 'Continue the quest' : 'Start the quest';
  main.innerHTML = '<section class="front-cover">'
    + asset('turtle', 'class="cover-art"') + '<div class="cover-copy">'
    + '<p class="eyebrow">English adventure · A2–A2+</p><h1 tabindex="-1">Turtle<br>Rescue</h1>'
    + '<p>A storm has left plastic all over Turtle Beach. Help Mia and Leo find their way to the coast and protect the turtle nests.</p>'
    + button(label, run.finished ? 'ending' : 'start')
    + '</div></section>';
}

function ending() {
  main.innerHTML = '<section class="front-cover end-cover">'
    + asset('hatchlings', 'class="cover-art"') + '<div class="cover-copy">'
    + '<p class="eyebrow">Saturday evening · Turtle Beach</p><h1 tabindex="-1">They made it<br>to the sea!</h1>'
    + '<p>The volunteers cleared the beach and kept the turtle nests safe. That evening, the ranger saw tiny turtles heading for the waves.</p>'
    + '<div class="ending-actions">' + button('Review the quest', 'review')
    + button('Play again', 'restart', 'secondary') + '</div></div></section>';
}

function render(focus = false) {
  locked = false;
  window.clearTimeout(pending);
  pending = 0;
  showRoute();
  if (screen === 'quest') {
    const changed = play();
    if (focus) {
      if (changed) window.scrollTo({ top: 0 });
      const speech = main.querySelector(':is(.boarding-car, .film-playing) #location-title') ?? main.querySelector('#spoken');
      speech.focus({ preventScroll: true });
      if (!changed && speech.getBoundingClientRect().top < 70) speech.scrollIntoView({ block: 'nearest' });
    }
  } else {
    renderedShot = '';
    if (screen === 'cover') cover();
    else ending();
    if (focus) {
      window.scrollTo({ top: 0 });
      main.querySelector('h1').focus({ preventScroll: true });
    }
  }
}

function report(text, ok = false) {
  const feedback = main.querySelector('#feedback');
  if (!feedback) return;
  feedback.textContent = text;
  feedback.className = 'feedback ' + (ok ? 'success' : 'hint');
}

function updateDialogue(beat) {
  const board = main.querySelector('#dialogue-board');
  const scroll = board.scrollTop;
  board.innerHTML = dialogueCards(beat);
  board.scrollTop = scroll;
  main.querySelector('#dialogue-count').textContent = dialogueCount(beat);
  main.querySelector('#dialogue-buttons').innerHTML = dialogueButtons(beat);
  return board;
}

function selectDialogueLine(index, keyboard) {
  const beat = currentBeat();
  if (beat.type !== 'order' || run.task.solved || !beat.lines[index]) return;
  const order = run.task.order;
  const position = order.indexOf(index);
  if (position === -1) order.push(index);
  else order.splice(position, 1);
  save();
  const board = updateDialogue(beat);
  report('');
  board.querySelector('[data-value="' + index + '"]').focus({ preventScroll: !keyboard });
}

function moveDialogueLine(control, offset) {
  const beat = currentBeat();
  if (beat.type !== 'order' || run.task.solved) return;
  const id = Number(control.closest('[data-line]').dataset.line);
  const order = run.task.order;
  const position = order.indexOf(id);
  const next = position + offset;
  if (position < 0 || next < 0 || next >= order.length) return;
  [order[position], order[next]] = [order[next], order[position]];
  save();
  const row = updateDialogue(beat).querySelector('[data-line="' + id + '"]');
  report('');
  const focus = row.querySelector('[data-action="' + control.dataset.action + '"]:not(:disabled)')
    ?? row.querySelector('[data-action="dialogue-line"]');
  focus.focus();
}

function resetDialogue() {
  const beat = currentBeat();
  if (beat.type !== 'order' || run.task.solved) return;
  run.task = emptyTask(beat.id);
  save();
  const board = updateDialogue(beat);
  report('');
  board.querySelector('button').focus();
  board.scrollTop = 0;
}

function checkDialogue() {
  const beat = currentBeat();
  const { order, solved } = run.task;
  if (beat.type !== 'order' || solved || order.length !== beat.lines.length) return;
  const mismatch = order.findIndex((line, index) => line !== index);
  if (mismatch !== -1) {
    const board = main.querySelector('#dialogue-board');
    const line = board.querySelector('[data-value="' + order[mismatch] + '"]');
    line.classList.add('is-wrong');
    if (board.scrollHeight > board.clientHeight) {
      line.focus({ preventScroll: true });
      line.scrollIntoView({ block: 'nearest' });
    }
    report('Check line ' + (mismatch + 1) + '. ' + beat.lines[mismatch].hint);
    return;
  }
  run.task.solved = true;
  save();
  updateDialogue(beat).scrollTop = 0;
  main.querySelector('#dialogue-help').hidden = true;
  report('That’s the right order.', true);
  main.querySelector('#dialogue-buttons [data-action="next"]').focus({ preventScroll: true });
}

function updateTiles(beat) {
  main.querySelector('#spoken').innerHTML = formattedLine(beat.text, tileGuess(beat));
  main.querySelector('#tile-help').hidden = run.task.solved;
  main.querySelector('.tile-task').classList.toggle('tile-solved', run.task.solved);
  const controls = main.querySelector('#tile-controls');
  controls.innerHTML = tileCards(beat);
  return controls;
}

function pickTile(index, keyboard) {
  const beat = currentBeat();
  if (beat.type !== 'tiles' || run.task.solved || beat.tokens[index] === undefined) return;
  const order = run.task.order;
  const position = order.indexOf(index);
  if (position === -1) order.push(index);
  else order.splice(position, 1);
  save();
  report('');
  const controls = updateTiles(beat);
  if (keyboard) controls.querySelector('[data-value="' + index + '"]').focus();
}

function checkTiles() {
  const beat = currentBeat();
  if (beat.type !== 'tiles' || run.task.solved || run.task.order.length !== taskSize(beat)) return;
  if (!matchesTask(beat, run.task.order)) {
    const hint = beat.letters ? 'The first word has four letters. It starts with “p”.' : 'Start with “' + beat.tokens[0] + '”.';
    report('Try again. ' + hint);
    return;
  }
  run.task.solved = true;
  save();
  updateTiles(beat).querySelector('[data-action="next"]').focus({ preventScroll: true });
  report('Correct!', true);
}

function resetTiles() {
  const beat = currentBeat();
  if (beat.type !== 'tiles' || run.task.solved) return;
  run.task = emptyTask(beat.id);
  save();
  report('');
  updateTiles(beat).querySelector('.tile').focus();
}

function advance() {
  if (target) {
    target.index++;
    if (target.index >= target.item.prompts.length) {
      const { collection, item } = target;
      const found = run.found[collection];
      if (!found.includes(item.id)) found.push(item.id);
      target = null;
      if (found.length === collections[collection].length) run.index++;
    }
  } else {
    const beat = currentBeat();
    if (beat.award === 'supplies') run.supplies = true;
    const chapter = chapters[run.chapter];
    if (run.index + 1 < chapter.steps.length) {
      run.index++;
    } else if (run.chapter + 1 < chapters.length) {
      run.chapter++;
      run.unlocked = Math.max(run.chapter, run.unlocked);
      run.index = 0;
    } else {
      run.finished = true;
      screen = 'ending';
    }
  }
  save();
  render(true);
}

function choose(control, value, map = false) {
  if (locked) return;
  const beat = currentBeat();
  if (value !== beat.answer) {
    main.querySelectorAll('.is-wrong').forEach(node => node.classList.remove('is-wrong'));
    control.classList.add('is-wrong');
    report(beat.hint);
    return;
  }
  locked = true;
  control.classList.remove('is-wrong');
  control.classList.add('is-correct');
  if (!map && beat.text.includes('{}')) {
    main.querySelector('#spoken').innerHTML = formattedLine(beat.text, beat.options[value]);
  }
  if (beat.routes) report('The bus gets you there around 9.50. The ranger is waiting at ten.', true);
  const driveTime = moveBus(beat);
  pending = window.setTimeout(advance, !motion ? 160 : driveTime || (beat.routes ? 970 : 540));
}

function moveBus(beat) {
  if (!beat.drive || !motion) return 0;
  const stage = main.querySelector('#stage');
  if (beat.drive === 'stop') {
    stage.classList.add('braking');
    return 920;
  }
  const road = scenes[beat.scene].road;
  const bus = stage.querySelector('.road-bus');
  const path = road.tracks[beat.drive];
  stage.classList.add('turning');
  bus.animate([road.start, ...path].map(roadPosition), { duration: 1320, easing: 'ease-in-out', fill: 'forwards' });
  return 1330;
}

function navigateChapter(index) {
  if (index > run.unlocked || !chapters[index]) return;
  target = null;
  run.chapter = index;
  run.index = 0;
  run.found = { friends: [], litter: [] };
  run.task = emptyTask();
  run.supplies = index > cafeChapter;
  screen = 'quest';
  save();
  render(true);
}

function updateMotion(active) {
  motion = active;
  document.body.classList.toggle('motion-off', !motion);
  const control = document.querySelector('[data-action="motion"]');
  control.textContent = motion ? 'Pause motion' : 'Play motion';
  control.setAttribute('aria-pressed', String(!motion));
  const film = main.querySelector('.scene-video');
  if (!motion) {
    finishPickup();
    film?.pause();
    main.querySelector('.film-playing')?.classList.remove('film-playing');
    main.querySelector('.play-next')?.removeAttribute('disabled');
    main.querySelector('.road-bus')?.getAnimations().forEach(animation => animation.finish());
  } else if (film && !film.ended) {
    film.play().catch(() => {});
  }
}

function fillKey() {
  const notes = [
    'Learners can reopen the notice during the quest.',
    'Walking from the station would take until 10.10. The 9.30 bus was due at the centre at about 9.50.',
    'Wear your seat belts. Turn left into Harbour Street. Go straight on at the first lights, then turn left into Station Road after the supermarket.',
    'Watch each journey. Nina gets off the train. Max rides on the cycle lane and wears a bike helmet. Alex stops, looks both ways, then crosses when it’s safe.',
    'Put the letters of push others in order. At the fork, keep right for Beech Street. Get off and wait on the pavement after the bus stops.',
    'Ask the pedestrian about Pine Café. Pick up the gloves and bags, then ask the owner for directions. Leave at 9.46 and reach the centre at about 9.54.',
    'Walk on the pavement, cross at the zebra crossing, then meet the ranger at the rescue centre.',
    'Pick up the bottle with gloves on. Tell the ranger about the bag behind the rope.',
  ];
  document.querySelector('#teacher-content').innerHTML = '<p>British English · A2–A2+. Ask learners to say each answer aloud before clicking, especially in the dialogues and at the road signs.</p>'
    + chapters.map((chapter, index) => {
      const steps = chapter.steps.flatMap(beat => beat.type === 'search' ? collections[beat.collection].flatMap(item => item.prompts) : [beat]);
      const entries = steps.filter(beat => ['pick', 'find', 'order', 'input', 'select', 'tiles'].includes(beat.type)).map(beat => {
        if (beat.type === 'order') {
          return '<li>' + escape(beat.text) + '<ol>' + beat.lines.map(line => '<li>'
            + (line.speaker ? '<strong>' + escape(line.speaker) + '</strong> · ' : '')
            + escape(line.text) + '</li>').join('') + '</ol></li>';
        }
        const answer = beat.type === 'tiles' ? beat.answer : beat.options?.[beat.answer] ?? beat.spots[beat.answer].label;
        const response = beat.text.includes('{}') ? beat.text.replace('{}', answer) : answer;
        return '<li>' + (beat.type === 'tiles' ? '<strong>' + escape(beat.speaker) + '</strong> · ' : '') + escape(response) + '</li>';
      }).join('');
      return '<details><summary>' + escape(chapter.name) + '</summary><p>' + escape(notes[index]) + '</p><ol>' + entries + '</ol></details>';
    }).join('');
}

document.addEventListener('click', event => {
  const control = event.target.closest('button[data-action]');
  if (!control || control.disabled) return;
  const action = control.dataset.action;
  const value = Number(control.dataset.value);
  switch (action) {
    case 'home':
      screen = 'cover';
      target = null;
      render(true);
      break;
    case 'start':
      screen = 'quest';
      run.started = true;
      save();
      render(true);
      break;
    case 'chapter':
      navigateChapter(value);
      break;
    case 'answer':
      choose(control, value);
      break;
    case 'dialogue-line':
      selectDialogueLine(value, event.detail === 0);
      break;
    case 'dialogue-up':
    case 'dialogue-down':
      moveDialogueLine(control, action === 'dialogue-up' ? -1 : 1);
      break;
    case 'dialogue-reset':
      resetDialogue();
      break;
    case 'dialogue-check':
      checkDialogue();
      break;
    case 'tile':
      pickTile(value, event.detail === 0);
      break;
    case 'tile-check':
      checkTiles();
      break;
    case 'tile-reset':
      resetTiles();
      break;
    case 'spot':
      choose(control, value, true);
      break;
    case 'investigate': {
      const collection = chapterBeat().collection;
      const item = collections[collection]?.[value];
      if (locked || !item || run.found[collection].includes(item.id)) break;
      target = { item, collection, index: 0 };
      render(true);
      break;
    }
    case 'cancel-search':
      target = null;
      render(true);
      break;
    case 'next':
      if (!locked) advance();
      break;
    case 'replay':
      renderedShot = '';
      render(true);
      break;
    case 'ending':
      screen = 'ending';
      render(true);
      break;
    case 'review':
      navigateChapter(0);
      break;
    case 'restart':
      run = cleanRun();
      run.started = true;
      target = null;
      screen = 'quest';
      save();
      render(true);
      break;
    case 'notice':
      noticeDialog.showModal();
      break;
    case 'teacher':
      if (!document.querySelector('#teacher-content').childElementCount) fillKey();
      teacherDialog.showModal();
      break;
    case 'motion':
      updateMotion(!motion);
      break;
  }
});

main.addEventListener('change', event => {
  if (event.target.id === 'word-select') choose(event.target, Number(event.target.value));
});

main.addEventListener('submit', event => {
  if (event.target.id !== 'word-form') return;
  event.preventDefault();
  const beat = currentBeat();
  const input = event.target.elements.word;
  if (input.value.trim().toLowerCase() === beat.options[beat.answer]) {
    choose(input, beat.answer);
  } else {
    input.classList.add('is-wrong');
    input.focus();
    report(beat.hint);
  }
});

reducedMotion.addEventListener('change', event => updateMotion(!event.matches));
document.querySelector('#notice-content').innerHTML = noticePaper();
warmUpcoming();
updateMotion(motion);
render();
