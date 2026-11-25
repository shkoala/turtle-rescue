export const notice = [
  'After last night’s storm, there’s plastic all over Turtle Beach. Endangered sea turtles come here to lay their eggs. Come and help us clean the beach this Saturday!',
  'Meet outside <strong>Pebble Bay Station at 9.25 a.m.</strong> The volunteer bus leaves at <strong>9.30 a.m.</strong> On the way, stop at <strong>Pine Café</strong> to pick up gloves and rubbish bags.',
  'Meet the ranger at the <strong>Pebble Bay Turtle Rescue Centre at 10 a.m.</strong> We’ll walk to the beach together.',
  'Anyone aged 12 or over can join. If you’re under 16, you must come with an adult. You should wear old trainers.',
];

export const scenes = {
  town: { place: 'Pebble Bay', time: 'Friday', art: 'town', cast: ['Mia', 'Leo'] },
  phone: { place: 'Group chat', time: 'Friday evening', art: 'town', cast: ['Mia', 'Leo'] },
  ready: { place: 'Getting ready', time: 'Saturday morning', art: 'town', cast: ['Mia', 'Leo'] },
  washout: { place: 'Mill Lane', time: 'Saturday morning', art: 'washed', cast: [] },
  warden: { place: 'Maple Street', time: 'Saturday morning', art: 'warden', cast: [] },
  station: { place: 'Pebble Bay Station', time: '9.25 a.m.', art: 'station', cast: ['Mia', 'Leo'] },
  ride: { place: 'On the volunteer bus', time: '9.30 a.m.', art: 'coast', cast: [], vehicle: 'moving' },
  tyre: { place: 'Beech Street', time: '9.40 a.m.', art: 'coast', cast: [], vehicle: 'burst' },
  cafe: { place: 'Pine Café', time: '9.40 a.m.', art: 'cafe', cast: ['Leo'] },
  walk: { place: 'On the way to the centre', time: '9.46 a.m.', art: 'town', cast: ['Mia', 'Leo'] },
  centre: { place: 'Turtle Rescue Centre', time: 'Just before 10 a.m.', art: 'centre', cast: ['Mia', 'Leo'] },
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

const crossSpots = [
  spot('Pavement', 25, 73), spot('Zebra crossing', 53, 81),
  spot('Rescue centre', 40, 42), spot('Path to the beach', 76, 50),
];

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
        ['Yes, you’re 12 or older and you’ll be with an adult.', 'Yes, children can come on their own.', 'No, everyone must be 16 or over.'],
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
      prep('Leo', 'What about after we meet at the station? Can we go to the rescue centre {} foot? Is it far?', 1, 'The expression for walking is “on foot”.'),
      say('phone', 'Nina', 'It’s a 45-minute walk from the station. We’re meeting there at 9.25, and the ranger is waiting at ten.', 'Compare the routes'),
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
      pick('ready', 'Max', 'Max always {} a helmet when he rides his bike.', ['wear', 'wears'], 1, 'Max is one person. Add -s in the present simple.'),
      pick('ready', 'Mum', 'In the car, Mia and Leo must {} seat belts.', ['wear', 'to wear'], 0, 'Use the base form after “must”.'),
      say('washout', 'Mum', 'Oh! The storm has washed away part of Mill Lane. We can’t take our usual road to the station.', 'Look at the diversion', { effect: 'washout' }),
      pick('washout', 'Mia', '{} at the junction. Follow the yellow diversion sign.', ['Go straight on', 'Turn right', 'Turn left'],
        2, 'Look at the arrow on the yellow sign.', { sign: 'diversion-left' }),
      pick('washout', 'Mia', 'The next light is green. At the traffic lights, {}.', ['go straight on', 'turn left', 'turn right'],
        0, 'Follow the arrow pointing straight ahead.', { sign: 'diversion-ahead' }),
      find('warden', 'Mum', 'The diversion ends here. I’ll pull into this bay and ask the traffic warden for directions.',
        [spot('Ask the traffic warden', 64, 51, 'person')], 0, ''),
      pick('warden', 'Mum', 'Excuse me. {}', ['Is there a café around here?', 'Do you know where the station is?', 'Is it far?'],
        1, 'Start by saying which place Mum needs to find.'),
      say('warden', 'Traffic warden', 'Yes. Go past the supermarket to the next set of traffic lights.', 'Check the turning'),
      pick('warden', 'Mum', '{}', ['Is it far?', 'Do I turn right at the traffic lights?', 'Can we go on foot?'],
        1, 'Mum knows which junction to look for. Now check where to turn.'),
      say('warden', 'Traffic warden', 'No, turn left into Station Road. The station is on your right, opposite the sports centre.', 'Ask how far it is'),
      pick('warden', 'Mum', '{}', ['Is it far?', 'Is there a cinema near here?', 'Can I park at the centre?'],
        0, 'Mum wants to know if the station is close.'),
      say('warden', 'Traffic warden', 'Not really. It’s only a couple of minutes from here.', 'Thank the warden'),
      say('warden', 'Mum', 'Thank you very much.', 'Continue'),
      say('warden', 'Traffic warden', 'Don’t mention it.', 'Go to the station'),
    ],
  },
  {
    name: 'The bus',
    steps: [
      find('station', 'Nina', 'You made it! Everyone’s here. Your mum can leave her car here and come with us.',
        [spot('Board the volunteer bus', 41, 54, 'door')], 0, ''),
      pick('station', 'Driver', 'When you get on the bus, don’t {}.', ['pushes', 'push'], 1, 'Use the base form after “don’t”.'),
      pick('station', 'Driver', 'If you’re standing on the bus, you should {} on to a handgrip.', ['hold', 'to hold'], 0, 'Use the base form after “should”.'),
      pick('station', 'Driver', 'You mustn’t {} out of the bus window.', ['leaning', 'lean'], 1, 'Use the base form after “mustn’t”.'),
      pick('station', 'Driver', 'You should {} the aisle clear.', ['keep', 'keeps'], 0, 'Use the base form after “should”.'),
      pick('station', 'Driver', 'Wait until the bus {} before you get off.', ['stop', 'stops'], 1, '“The bus” is singular.'),
      say('ride', 'Driver', 'It’s 9.30. First stop, Pine Café!', 'Ride to the café', { type: 'clip', duration: 1650 }),
      pick('ride', 'Mia', 'We can’t go straight on here. Which way can we go?', ['Turn right', 'Turn left'],
        1, 'Follow the white arrow on the blue sign.', { sign: 'left-only' }),
      can('ride', 'Mia', 'You {} turn left here.', 1, 'The left arrow is crossed out.', 'no-left'),
      pick('ride', 'Leo', 'The café is on Beech Street. The street sign points right. {} into Beech Street.',
        ['Go straight on', 'Turn right', 'Turn left'], 1, 'Follow the sign to Beech Street.', { sign: 'right' }),
      can('ride', 'Mia', 'You {} drive at 30 mph here when it’s safe.', 0, 'This is the speed limit.', 'speed'),
      can('ride', 'Leo', 'You {} drive at 40 mph here.', 1, '40 mph is above the limit.', 'speed'),
      can('ride', 'Mia', 'You {} drive into this side street.', 1, 'This sign means No entry.', 'no-entry'),
      pick('ride', 'Leo', '{} and wait until they turn green.',
        ['Go straight on', 'Turn right', 'Stop at the traffic lights'], 2, 'The red light is on.', { sign: 'lights' }),
      pick('ride', 'Mia', 'The light is green now. The café is up ahead. {}.',
        ['Go straight on', 'Turn left', 'Turn right'], 0, 'Up ahead means in front of the bus.', { sign: 'green' }),
      say('tyre', 'Driver', 'A tyre burst as we pulled into the bay. We’re safely stopped, but this bus can’t go anywhere yet.', 'Check the time',
        { type: 'clip', duration: 2000, effect: 'burst' }),
      say('cafe', 'Mia', 'It’s 9.40. Pine Café is right here. Let’s get the gloves and bags, then ask how far it is to the centre from here.', 'Look for Pine Café', { vehicle: 'parked' }),
    ],
  },
  {
    name: 'Pine Café',
    steps: [
      find('cafe', 'Leo', 'I can’t see the café sign from the bay. There’s someone by the corner. I’ll ask them.',
        [spot('Ask a passer-by', 51, 51, 'person')], 0, ''),
      pick('cafe', 'Leo', 'Is there a café around here?',
        ['Yes, the bank is next to the chemist’s.', 'Yes, there’s one on the corner. It’s called Pine Café.', 'Not really. It takes 45 minutes.'],
        1, 'Choose the reply that gives the location of a café.'),
      find('cafe', 'Café owner', 'You’re the volunteers! The gloves and rubbish bags are in the box by the door.',
        [spot('Collect the gloves and bags', 48, 68, 'supplies')], 0, '', { award: 'supplies' }),
      say('cafe', 'Café owner', 'The rescue centre is an eight-minute walk from here. Go past the bank and follow the pavement to the zebra crossing.', 'Ask about the bank'),
      pick('cafe', 'Leo', 'Which question helps us find that landmark?',
        ['Do you know where the bank is?', 'Is there a cinema near here?', 'Do I turn right at the station?'],
        0, 'The café owner tells Leo to go past the bank.'),
      say('cafe', 'Café owner', 'Yes, it’s next to the chemist’s.', 'Ask about parking'),
      say('cafe', 'Driver', 'I’ll wait for help with the tyre. Can you text me where to park near the centre in case I can follow later?', 'Talk to the café owner'),
      pick('cafe', 'Leo', 'What can I ask the owner for the driver?',
        ['Can I buy a bag?', 'Is there a car park near the rescue centre?', 'Do we go by plane?'],
        1, 'The driver needs somewhere to park the bus.'),
      say('cafe', 'Café owner', 'Yes, there’s one opposite the rescue centre. It has spaces for buses.', 'Thank the owner'),
      say('cafe', 'Leo', 'Thank you very much.', 'Continue'),
      say('cafe', 'Café owner', 'Don’t mention it.', 'Decide what to do next'),
      pick('cafe', 'Mia', 'It’s 9.46 now. From the café, the walk takes eight minutes. What should we do?',
        ['Wait here for the bus to be fixed.', 'We should walk to the centre with the adults.', 'Run across the road to the beach.'],
        1, 'An eight-minute walk from 9.46 gets you there at 9.54.', { routes: 'cafe', time: '9.46 a.m.' }),
      say('walk', 'Mia', 'There’s the chemist’s. The bank is next to it. Let’s go past the bank together.', 'Walk to the crossing',
        { type: 'clip', duration: 1350 }),
    ],
  },
  {
    name: 'The crossing',
    steps: [
      say('centre', 'Leo', 'We’ve arrived. Before we cross, let’s text the driver what the signs say.', 'Check the parking signs'),
      can('centre', 'Leo', 'You {} park outside the rescue centre.', 1, 'The red line means No parking.', 'no-parking'),
      can('centre', 'Leo', 'You {} park in the car park opposite the centre.', 0, 'The P sign marks the car park. There are spaces for buses.', 'parking'),
      say('centre', 'Leo', 'There are spaces for buses opposite the centre. I’ve sent the driver a message.', 'Find the safe way across'),
      find('centre', 'Mia', 'Choose the first part of our route. We’re on the same side as the car park.', crossSpots, 0,
        'Stay on the pavement and walk to the zebra crossing.'),
      find('centre', 'Mia', 'Stop at the kerb and look both ways. Where should we cross when it’s safe?', crossSpots, 1,
        'Use the zebra crossing.', { visited: [0] }),
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
      { type: 'search', scene: 'cleanup', speaker: 'Mia', text: 'Look for the two pieces of rubbish. Decide what to do with each one.' },
      say('cleanup', 'Ranger', 'Thanks for telling me about the bag. I’ll take care of it. You’ve cleared the rubbish from the open beach!', 'Finish the clean-up'),
      say('dusk', 'Narrator', 'That evening, the ranger sends a video to the group chat. A few tiny turtles have just come out of the sand.', 'Watch the video'),
      say('dusk', 'Mia', 'Look! They’re making their way to the sea.', 'See the ending', { type: 'clip', duration: 4200, effect: 'hatch' }),
    ],
  },
];

export const litter = [
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
