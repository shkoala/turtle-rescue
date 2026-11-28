export const notice = [
  'After last night’s storm, there’s plastic all over Turtle Beach. Endangered sea turtles come here to lay their eggs. Come and help us clean the beach this Saturday!',
  'Meet outside <strong>Pebble Bay Station at 9.25 a.m.</strong> The volunteer bus leaves at <strong>9.30 a.m.</strong> It stops at <strong>Pine Café</strong> so we can pick up gloves and rubbish bags.',
  'Meet the ranger at the <strong>Pebble Bay Turtle Rescue Centre at 10 a.m.</strong> We’ll walk to the beach together.',
  'Anyone aged 12 or over can join. If you’re under 16, you must come with an adult. You should wear old trainers.',
];

const road = (place, time, art, start, posts, tracks) => ({
  place, time, art, cast: [], road: { start, posts, tracks },
});
const post = (sign, x, y, scale = 1) => ({ sign, x, y, scale });

export const scenes = {
  town: { place: 'Pebble Bay', time: 'Friday', art: 'town', cast: ['Mia', 'Leo'] },
  phone: { place: 'Group chat', time: 'Friday evening', art: 'town', cast: ['Mia', 'Leo'], poses: { Mia: 'phone' } },
  ready: { place: 'Getting ready', time: 'Saturday morning', art: 'town', cast: ['Mia', 'Leo'] },
  car: { place: 'Mum’s car', time: 'Saturday morning', art: 'car-inside', cast: [] },
  washout: { place: 'Mill Lane', time: 'Saturday morning', art: 'washed', cast: [] },
  carLights: road('Station Road diversion', 'Saturday morning', 'road-lights', null,
    [post('green', 24, 63, .86), post('diversion-ahead', 21, 71, .76)], {}),
  warden: { place: 'Maple Street', time: 'Saturday morning', art: 'warden', cast: [] },
  station: { place: 'Pebble Bay Station', time: '9.25 a.m.', art: 'station-forecourt', cast: ['Mia', 'Leo', 'Nina', 'Max', 'Alex'] },
  trainTrip: { place: 'Arriving by train', time: 'Saturday morning', art: 'train-trip', video: 'train-trip', cast: [] },
  bikeTrip: { place: 'On the cycle lane', time: 'Saturday morning', art: 'bike-trip', video: 'bike-trip', cast: [] },
  footTrip: { place: 'On the way to the station', time: 'Saturday morning', art: 'foot-trip', video: 'foot-trip', cast: [] },
  boarding: { place: 'The volunteer bus stop', time: '9.28 a.m.', art: 'station', cast: ['Mia', 'Leo'] },
  ride: { place: 'On the volunteer bus', time: '9.30 a.m.', art: 'bus-group', cast: [] },
  junction: road('Harbour junction', '9.32 a.m.', 'road-left', [34, 94, 1, 0],
    [post('left-only', 20, 70)], { left: [[35, 77, .72, 0], [29, 60, .45, -4], [14, 48, .23, -7]] }),
  fork: road('The fork for Beech Street', '9.34 a.m.', 'road-fork', [40, 94, 1, 0],
    [post('no-left', 17, 68, .88), post('right', 50, 49, .84)], { right: [[45, 76, .72, 0], [60, 58, .44, 4], [76, 38, .20, 6]] }),
  beech: road('Beech Street', '9.36 a.m.', 'road-speed', [45, 95, 1, 0],
    [post('speed', 32, 71)], { ahead: [[46, 76, .66, 0], [54, 53, .29, 0]] }),
  fallen: road('The blocked lane', '9.37 a.m.', 'road-tree', [25, 94, 1, 0],
    [post('no-entry', 64, 61, .9)], { main: [[24, 77, .72, 0], [18, 64, .46, -4], [17, 50, .24, -6]] }),
  signals: road('Village crossroads', '9.39 a.m.', 'road-lights', [40, 85, 1, 0],
    [post('signal', 26, 63)], { ahead: [[44, 66, .65, 0], [50, 48, .25, 0]] }),
  tyre: { place: 'Beech Street', time: '9.40 a.m.', art: 'coast', cast: [] },
  street: { place: 'Beech Street', time: '9.41 a.m.', art: 'street-trip', video: 'street-trip', cast: [] },
  cafe: { place: 'Pine Café', time: '9.43 a.m.', art: 'cafe-entrance', cast: [] },
  walk: { place: 'On the way to the centre', time: '9.46 a.m.', art: 'centre-trip', video: 'centre-trip', cast: [] },
  centre: { place: 'Turtle Rescue Centre', time: 'Before 10 a.m.', art: 'centre-clear', cast: [] },
  crossingWalk: { place: 'Zebra crossing', time: 'Before 10 a.m.', art: 'cross-trip', video: 'cross-trip', cast: [] },
  briefing: { place: 'Turtle Beach', time: 'Saturday morning', art: 'briefing', cast: [] },
  cleanup: { place: 'Turtle Beach', time: 'Saturday morning', art: 'cleanup', cast: ['Mia'] },
  dusk: { place: 'Turtle Beach', time: 'Saturday evening', art: 'hatchlings', cast: [] },
};

const say = (scene, speaker, text, next, extras = {}) => ({ scene, speaker, text, next, type: 'say', ...extras });
const pick = (scene, speaker, text, options, answer, hint, extras = {}) => ({
  scene, speaker, text, options, answer, hint, type: 'pick', ...extras,
});
const find = (scene, speaker, text, spots, answer, hint, extras = {}) => ({
  scene, speaker, text, spots, answer, hint, type: 'find', ...extras,
});
const spot = (label, x, y, kind = '') => ({ label, x, y, kind });
const prep = (speaker, text, answer, hint) => pick('phone', speaker, text, ['by', 'on', 'in'], answer, hint);
const can = (scene, speaker, text, answer, hint, sign) =>
  pick(scene, speaker, text, ['can', 'can’t'], answer, hint, { sign });
const clip = (scene, speaker, text, next, duration) =>
  say(scene, speaker, text, next, { type: 'clip', duration });
const tiles = (id, scene, speaker, text, answer, letters = false) => ({
  id, type: 'tiles', scene, speaker, text, answer, letters,
  tokens: letters ? Array.from(answer.replaceAll(' ', '')) : answer.split(' '),
});

const crossSpots = [
  spot('Pavement', 31, 93), spot('Zebra crossing', 49, 77),
  spot('Rescue centre', 40, 46), spot('Path to the beach', 79, 52),
];

const stationDialogue = {
  id: 'warden', type: 'order', scene: 'warden', text: 'Put the dialogue in order.', next: 'Go to the station',
  shuffled: [3, 6, 1, 5, 0, 7, 2, 4],
  lines: [
    { speaker: 'Mum', text: 'Excuse me. Do you know where the station is?', hint: 'Start with a polite question about the station.' },
    { speaker: 'Traffic warden', text: 'Yes. Go past the supermarket to the next set of traffic lights.', hint: 'The warden says where to go first.' },
    { speaker: 'Mum', text: 'Do I turn right at the traffic lights?', hint: 'Mum asks which way to turn after she hears about the lights.' },
    { speaker: 'Traffic warden', text: 'No, turn left into Station Road. The station is on your right, opposite the sports centre.', hint: 'Find the answer to “Do I turn right?”' },
    { speaker: 'Mum', text: 'Left into Station Road. Got it. Is it far?', hint: 'Mum repeats the turning and asks how far it is.' },
    { speaker: 'Traffic warden', text: 'Not really. It’s only a couple of minutes from here.', hint: 'Find the answer to “Is it far?”' },
    { speaker: 'Mum', text: 'Thank you very much.', hint: 'Mum thanks the warden for the directions.' },
    { speaker: 'Traffic warden', text: 'Don’t mention it.', hint: 'The warden replies to “Thank you very much.”' },
  ],
};

const crossingOrder = {
  id: 'alex-crossing', type: 'order', scene: 'footTrip', text: 'Put the steps in order.', next: 'Back to the station',
  shuffled: [2, 0, 1],
  lines: [
    { text: 'Stop at the kerb.', hint: 'First, stop at the edge of the pavement.' },
    { text: 'Look both ways before crossing.', hint: 'Check for traffic before you cross.' },
    { text: 'Cross when it’s safe.', hint: 'Cross after you look both ways.' },
  ],
};

export const chapters = [
  {
    name: 'The notice',
    steps: [
      find('town', 'Mia', 'The rescue centre has put up a notice. Let’s see what it says.',
        [spot('Read the notice', 16, 43, 'poster')], 0, ''),
      say('town', 'Mia', 'Can you help us check the details before we make a plan?', 'Check the plan', { notice: true }),
      pick('town', 'Leo', 'What happened to Turtle Beach after the storm?',
        ['The beach was closed.', 'Plastic washed up all over the beach.', 'The turtle nests moved.'],
        1, 'Look at the first line of the notice.', { reading: true }),
      pick('town', 'Mia', 'Why is the beach important to the turtles?',
        ['They come here to lay their eggs.', 'They learn to swim here.', 'Volunteers feed them here.'],
        0, 'Find the sentence about eggs.', { reading: true }),
      pick('town', 'Leo', 'Where does the bus leave from, and what time does it leave?',
        ['Pine Café at 9.25 a.m.', 'Pebble Bay Station at 9.25 a.m.', 'Pebble Bay Station at 9.30 a.m.'],
        2, 'The group meets at 9.25. Find when the bus leaves.', { reading: true }),
      pick('town', 'Mia', 'Why do the volunteers need to stop at Pine Café?',
        ['To find the ranger.', 'To pick up gloves and rubbish bags.', 'To have breakfast.'],
        1, 'Find what they need to pick up on the way.', { reading: true }),
      pick('town', 'Leo', 'Where and when will they meet the ranger?',
        ['On the beach at 10 a.m.', 'At the station at 9.30 a.m.', 'At the rescue centre at 10 a.m.'],
        2, 'The notice says they’ll walk to the beach with the ranger after they meet.', { reading: true }),
      pick('town', 'Mia', 'Leo and I are 13. Can we join if Mum comes with us?',
        ['Yes, you’re both older than 12 and you’ll be with an adult.', 'Yes, children can come on their own.', 'No, everyone must be 16 or over.'],
        0, 'Look at both age rules in the notice.', { reading: true }),
      say('town', 'Mia', 'Mum says she can come. I’ll send the notice to the group!', 'Open the group chat'),
    ],
  },
  {
    name: 'Group chat',
    steps: [
      prep('Mia', 'How are you getting to the station tomorrow? Leo and I are coming {} Mum’s car. Mum’s joining the clean-up too.', 2, 'Mia is talking about a particular car.'),
      prep('Nina', 'Mum and I are coming {} train. See you at Pebble Bay Station!', 0, 'Use “by” to talk about a way of travelling.'),
      prep('Max', 'Dad and I are coming {} bike. We’ll leave our bikes at the station.', 0, 'Say “by bike” to describe how they’re travelling.'),
      prep('Alex', 'I got to Pebble Bay {} plane this morning to visit my aunt. We’ll walk to the station tomorrow.', 0, 'Use “by” with plane, train and bike.'),
      prep('Leo', 'And how will we get to the beach from the station? Can we go to the rescue centre {} foot?', 1, 'We say “on foot”.'),
      say('phone', 'Nina', 'It takes 45 minutes to walk to the centre. We meet at 9.25, and the ranger is waiting at ten.', 'Compare the routes'),
      pick('phone', 'Mia', 'How should we get from the station to the rescue centre?',
        ['We should walk from the station.', 'We should take the volunteer bus.'],
        1, 'A 45-minute walk from 9.25 ends at 10.10. The ranger is waiting at ten.',
        { routes: true }),
      prep('Nina', 'Good plan! See you {} the volunteer bus tomorrow.', 1, 'Say “on the bus” when you mean aboard that bus.'),
      say('phone', 'Leo', 'The bus should get us there around 9.50, even with the café stop. See you at the station!', 'Saturday morning'),
    ],
  },
  {
    name: 'The washout',
    steps: [
      say('ready', 'Max', 'Dad and I are about to leave. See you at the station!', 'Get into Mum’s car'),
      pick('car', 'Mum', 'Ready to go? Remember to {} your seat belts.', ['wear', 'carry', 'take off'], 0,
        'You wear your seat belt in the car.', { effect: 'pickup', duration: 2600 }),
      pick('washout', 'Mum', 'Mill Lane is blocked. We can’t go {} on.', ['left', 'straight', 'right'], 1,
        'The road ahead is closed.', { effect: 'washout' }),
      pick('washout', 'Mia', 'Turn {} into Harbour Street.', ['right', 'left'], 1,
        'The yellow arrow points left.', { sign: 'diversion-left' }),
      pick('carLights', 'Mia', 'The next light is green. At the traffic lights, {}.', ['go straight on', 'turn left', 'turn right'],
        0, 'Follow the arrow pointing straight ahead on the yellow sign.'),
      pick('warden', 'Mum', 'Let’s ask the traffic {} for directions.', ['warden', 'light', 'lane'], 0,
        'A traffic warden is a person.', { type: 'select' }),
      stationDialogue,
    ],
  },
  {
    name: 'The station',
    steps: [
      say('station', 'Mia', 'We’re at the station! How did the others get here?', 'Meet the others'),
      { type: 'search', collection: 'friends', scene: 'station', speaker: 'Mia', text: 'Tap Nina, Max and Alex to see how they got here.' },
      say('station', 'Leo', 'Everyone’s here. The bus leaves at 9.30. Let’s go to the bus stop!', 'Go to the bus stop'),
    ],
  },
  {
    name: 'The bus',
    steps: [
      find('boarding', 'Nina', 'There’s the volunteer bus. Let’s get on together.',
        [spot('Board the volunteer bus', 41, 54, 'door')], 0, ''),
      tiles('bus-rule', 'ride', 'Driver', 'Wait for your turn. Don’t {} when you get on the bus.', 'push others', true),
      pick('ride', 'Driver', 'If you’re standing, {} a handgrip.', ['hold on to', 'get off', 'lean out of'], 0,
        'Hold the handgrip so you don’t fall.'),
      pick('ride', 'Driver', 'You mustn’t {} out of the bus window.', ['leaning', 'lean'], 1, 'Use “lean” after “mustn’t”.'),
      pick('ride', 'Driver', 'Please {} the aisle clear.', ['carry', 'keep', 'fasten'], 1,
        'Leave space for people to walk.'),
      pick('ride', 'Driver', 'Wait for the bus to stop before you {}.', ['get on', 'turn off', 'get off'], 2,
        'We say “get off” when we leave a bus.'),
      say('ride', 'Driver', 'Everyone’s on board. First stop, Pine Café!', 'Set off'),
      pick('junction', 'Mia', 'We’re at the harbour. Which way can we go?', ['We can turn right.', 'We can turn left.', 'We can go straight on.'],
        1, 'Follow the white arrow on the blue sign.', { drive: 'left' }),
      can('fork', 'Mia', 'The road splits in two. We {} take the road on the left.', 1, 'The sign shows you can’t go left.'),
      pick('fork', 'Leo', 'The café is on Beech Street. {} at the fork.',
        ['Keep left', 'Keep right', 'Go back'], 1, 'Take the road on the right.', { drive: 'right' }),
      can('beech', 'Mia', 'You {} drive at 30 mph here when it’s safe.', 0, 'This is the speed limit.'),
      pick('beech', 'Leo', 'You {} drive at 40 mph here.', ['can', 'can’t'], 1,
        '40 mph is above the limit.', { drive: 'ahead' }),
      pick('fallen', 'Mia', 'A tree has fallen across the side street. We {} drive into it.',
        ['can', 'can’t'], 1, 'The red and white sign means No entry. The main road is clear.', { drive: 'main' }),
      pick('signals', 'Leo', '{} and wait for green.',
        ['Go straight on', 'Turn right', 'Stop at the traffic lights'], 2, 'The red light is on.', { signal: 'lights', drive: 'stop' }),
      pick('signals', 'Mia', 'The light is green now. {} at the traffic lights.',
        ['Go straight on', 'Turn left', 'Turn right'], 0, 'Keep going on this road.', { signal: 'green', drive: 'ahead' }),
      say('tyre', 'Driver', 'Oh no! We’ve got a flat tyre. The bus can’t go any further. Please get off and wait on the pavement.', 'Get off the bus',
        { type: 'clip', duration: 2000, effect: 'burst' }),
    ],
  },
  {
    name: 'Pine Café',
    steps: [
      clip('street', 'Mia', 'Let’s walk along the pavement with Mum. We can ask that pedestrian where Pine Café is.', 'Ask the pedestrian', 3300),
      pick('street', 'Leo', 'Excuse me. Is there a café near here?',
        ['The bank opens at ten.', 'Yes. Walk straight on. Pine Café is on your left, just past the corner.', 'The station is on Station Road.'],
        1, 'Look for the answer about the café.'),
      find('cafe', 'Café owner', 'Hello! Here are your gloves and rubbish bags.',
        [spot('Pick up the gloves and bags', 54, 62, 'supplies')], 0, '', { award: 'supplies' }),
      say('cafe', 'Mia', 'We’ve got the gloves and bags. What can we ask to find the rescue centre?', 'Build the dialogue'),
      tiles('cafe-question', 'cafe', 'Leo', '{}', 'Is the rescue centre far from here?'),
      tiles('cafe-distance', 'cafe', 'Café owner', '{} It’s an eight-minute walk.', 'No, it isn’t.'),
      tiles('cafe-where', 'cafe', 'Mia', '{}', 'Where is it?'),
      tiles('cafe-directions', 'cafe', 'Café owner', 'Go past the bank. {} The centre is across the road.', 'Walk on the pavement to the zebra crossing.'),
      tiles('cafe-thanks', 'cafe', 'Leo', '{}', 'Thank you very much.'),
      tiles('cafe-reply', 'cafe', 'Café owner', '{}', 'Don’t mention it.'),
      clip('walk', 'Mia', 'There’s the bank. Keep walking on the pavement to the zebra crossing.', 'Go to the crossing', 3400),
    ],
  },
  {
    name: 'The crossing',
    steps: [
      find('centre', 'Mia', 'There’s the centre! Where should we walk first?', crossSpots, 0,
        'Walk on the pavement.'),
      find('centre', 'Mia', 'Stop at the kerb and look both ways. Where should we cross when it’s safe?', crossSpots, 1,
        'Use the zebra crossing.', { visited: [0] }),
      clip('crossingWalk', 'Mia', 'It’s safe now. We can cross at the zebra crossing.', 'Meet the ranger', 2700),
      find('centre', 'Leo', 'It’s ten o’clock. Where are we meeting the ranger?', crossSpots, 2,
        'The ranger is waiting outside the rescue centre.', { visited: [0, 1] }),
      find('centre', 'Ranger', 'You made it, and you’ve got the gloves and bags! Let’s follow the path down to Turtle Beach.',
        crossSpots, 3, 'Follow the path from the centre to the beach.', { visited: [0, 1, 2] }),
    ],
  },
  {
    name: 'Turtle Beach',
    steps: [
      say('briefing', 'Ranger', 'Welcome to Turtle Beach. Before we start, look at the rope. It protects the turtle nests.', 'Listen to the briefing'),
      can('briefing', 'Ranger', 'We’ve got spare bags. You {} take another one if you need it.', 0, 'There are extra bags available.'),
      can('briefing', 'Ranger', 'There’s no tap on the beach. You {} refill your water bottle here.', 1, 'There is nowhere to fill a bottle.'),
      pick('briefing', 'Ranger', 'You {} wear gloves when you pick up rubbish.', ['must', 'mustn’t'], 0, 'The gloves are required.'),
      pick('briefing', 'Ranger', 'The turtle nests are behind the rope. You {} step over it.', ['must', 'mustn’t'], 1, 'Stay on the open side of the rope.'),
      pick('briefing', 'Ranger', 'It’s sunny today. You {} wear a hat.', ['should', 'shouldn’t'], 0, 'A hat is a good idea in the sun.'),
      pick('briefing', 'Ranger', 'Full bags are hard to carry. You {} fill yours right to the top.', ['should', 'shouldn’t'], 1, 'Leave room so the bag is easier to carry.'),
      say('cleanup', 'Mia', 'I can see a bottle on the open sand. There’s a plastic bag behind the rope, too.', 'Start the beach clean-up'),
      { type: 'search', collection: 'litter', scene: 'cleanup', speaker: 'Mia', text: 'Look for the two pieces of rubbish. Decide what to do with each one.' },
      say('cleanup', 'Ranger', 'Thanks for telling me about the bag. I’ll take care of it. You’ve cleared the rubbish from the open beach!', 'Finish the clean-up'),
      say('dusk', 'Narrator', 'That evening, the ranger sends a video to the group chat. A few tiny turtles have just come out of the sand.', 'Watch the video'),
      say('dusk', 'Mia', 'Look! They’re making their way to the sea.', 'See the ending', { type: 'clip', duration: 4200, effect: 'hatch' }),
    ],
  },
];

const litter = [
  {
    id: 'bottle', spot: spot('Bottle on the open sand', 35, 72, 'bottle'),
    prompts: [
      pick('cleanup', 'Mia', 'What can we pick up here?', [
        'We can pick up the bottle with our gloves on.', 'We can step over the rope to look for more rubbish.',
      ], 0, 'The bottle is on the open side. Keep your gloves on.'),
    ],
    done: 'Bottle collected',
  },
  {
    id: 'bag', spot: spot('Bag behind the rope', 76, 46, 'bag'),
    prompts: [
      pick('cleanup', 'Leo', 'I’ll get the bag behind the rope.', [
        'You mustn’t step over the rope.', 'You must move the rope first.',
      ], 0, 'The rope protects the turtle nests.'),
      pick('cleanup', 'Mia', 'What should we do about the bag?', [
        'We should reach for it.', 'We should tell the ranger about it.',
      ], 1, 'The ranger can take care of rubbish in the protected area.'),
    ],
    done: 'Ranger told',
  },
];

const friends = [
  {
    id: 'nina', spot: spot('Nina', 35, 31, 'person'),
    prompts: [
      clip('trainTrip', 'Nina', 'Mum and I came by train. Here we are!', 'Help Nina', 3100),
      pick('trainTrip', 'Mum', 'The train has stopped. {} the train.', ['Get on', 'Get off', 'Get into'], 1,
        'Nina is leaving the train.'),
    ],
    done: 'Nina · by train',
  },
  {
    id: 'max', spot: spot('Max', 43, 28, 'person'),
    prompts: [
      clip('bikeTrip', 'Max', 'Dad and I are going to the station by bike.', 'Help Max', 3700),
      pick('bikeTrip', 'Dad', 'Ride on the {}.', ['main road', 'cycle lane', 'pavement'], 1,
        'Look for the bicycle symbol.'),
      pick('bikeTrip', 'Dad', 'Wear a bike {}.', ['helmet'], 0,
        'It protects your head.', { type: 'input' }),
      pick('station', 'Max', 'I’ve parked my bike. I can {} my helmet in my hand.',
        ['wear', 'carry'], 1, 'You carry something when you hold it and take it with you.'),
    ],
    done: 'Max · by bike',
  },
  {
    id: 'alex', spot: spot('Alex', 51, 31, 'person'),
    prompts: [
      clip('footTrip', 'Alex', 'My aunt and I are walking to the station.', 'Help Alex', 3300),
      pick('footTrip', 'Aunt', '{} into the road.', ['Run', 'Don’t run'], 1, 'Walk and stop at the kerb.'),
      crossingOrder,
    ],
    done: 'Alex · on foot',
  },
];

export const collections = { friends, litter };
