export const notice = [
  'After last night’s storm, there’s plastic all over Turtle Beach. Endangered sea turtles come here to lay their eggs. Come and help us clean the beach this Saturday!',
  'Meet outside <strong>Pebble Bay Station at 9.25 a.m.</strong> The volunteer bus leaves at <strong>9.30 a.m.</strong> On the way, stop at <strong>Pine Café</strong> to pick up gloves and rubbish bags.',
  'Meet the ranger at the <strong>Pebble Bay Turtle Rescue Centre at 10 a.m.</strong> We’ll walk to the beach together.',
  'Anyone aged 12 or over can join. If you’re under 16, you must come with an adult. You should wear old trainers.',
];

const question = (text, options, answer, hint) => ({ text, options, answer, hint });
const slot = (text, options, answer, hint) => ({ text, options, answer, hint });
const prep = (text, answer, hint) => slot(text, ['by', 'on', 'in'], answer, hint);
const permission = (text, answer, hint) => slot(text, ['can', 'can’t'], answer, hint);

export const stages = [
  {
    id: 'notice',
    label: 'The notice',
    title: 'Help us clean Turtle Beach!',
    when: 'Friday · Pebble Bay',
    art: 'turtle',
    alt: 'A sea turtle glides through turquoise water.',
    parts: [
      {
        id: 'reading',
        type: 'reading',
        title: 'Read the notice and answer.',
        questions: [
          question('What happened to Turtle Beach after the storm?', [
            'The beach was closed.', 'Plastic washed up all over the beach.', 'The turtle nests moved.',
          ], 1, 'Look at the first sentence. What is all over the beach?'),
          question('Why is the beach important to the turtles?', [
            'They come here to lay their eggs.', 'They learn to swim here.', 'Volunteers feed them here.',
          ], 0, 'Find the sentence about eggs.'),
          question('Where does the bus leave from, and what time does it leave?', [
            'Pine Café at 9.25 a.m.', 'Pebble Bay Station at 9.25 a.m.', 'Pebble Bay Station at 9.30 a.m.',
          ], 2, 'The time to meet is 9.25. Look for “leaves”.'),
          question('Why do the volunteers need to stop at Pine Café?', [
            'To find the ranger.', 'To pick up gloves and rubbish bags.', 'To have breakfast.',
          ], 1, 'Look for what they need to pick up on the way.'),
          question('Where and when will they meet the ranger?', [
            'On the beach at 10 a.m.', 'At the station at 9.30 a.m.', 'At the rescue centre at 10 a.m.',
          ], 2, 'Find the sentence that starts “Meet the ranger”.'),
          question('Mia and Leo are 13. Can they join if Mia’s mum comes with them? Find the answer in the notice.', [
            'Yes, they’re 12 or older and will be with an adult.', 'Yes, children can come on their own.', 'No, everyone must be 16 or over.',
          ], 0, 'Read both rules in the last paragraph.'),
        ],
        done: 'Mia shares the notice in the group chat.',
      },
    ],
  },
  {
    id: 'chat',
    label: 'Group chat',
    title: 'How are we getting there?',
    when: 'Friday evening · Group chat',
    art: 'station',
    alt: 'A volunteer bus waits outside Pebble Bay Station.',
    parts: [
      {
        id: 'chat',
        type: 'chat',
        title: 'Complete the messages with by, on or in.',
        messages: [
          { person: 'Mia', text: 'How are you getting to the station tomorrow? Leo and I are coming {0} Mum’s car. Mum’s joining the clean-up too.' },
          { person: 'Nina', text: 'Mum and I are coming {1} train. See you at Pebble Bay Station!' },
          { person: 'Max', text: 'Dad and I are coming {2} bike. We’ll leave our bikes at the station.' },
          { person: 'Alex', text: 'I got here {3} plane this morning. My aunt and I will walk to the station tomorrow.' },
          { person: 'Leo', text: 'What about after we meet at the station? Can we go to the rescue centre {4} foot? Is it far?' },
          { person: 'Nina', text: 'It’s a 45-minute walk from the station. We’re meeting there at 9.25.' },
        ],
        gaps: [
          prep('Mia’s message', 'in', 'We say “in Mum’s car” when we name a particular car.'),
          prep('Nina’s message', 'by', 'Use “by” for a way of travelling with no article.'),
          prep('Max’s message', 'by', 'Use “by” with the name of the transport.'),
          prep('Alex’s message', 'by', 'Use “by” with plane, train, bus and bike.'),
          prep('Leo’s message', 'on', 'The phrase for walking is “on foot”.'),
        ],
      },
      {
        id: 'plan',
        type: 'plan',
        title: 'Decide how to get to the rescue centre.',
        intro: 'The group meets at Pebble Bay Station at 9.25 a.m. The ranger is waiting at the rescue centre at 10 a.m.',
        routes: [
          { name: 'On foot', detail: 'Leave the station at 9.25 a.m. · 45-minute walk' },
          { name: 'By volunteer bus', detail: 'Bus leaves at 9.30 a.m. · About 20 minutes, including the stop at Pine Café' },
        ],
        questions: [
          question('Choose the best message for the group chat.', [
            'We should go on foot. We’ll get to the centre by ten.',
            'We should go by bus. We’ll get there in time.',
            'We should walk straight to the beach and meet the ranger there.',
          ], 1, 'Check the meeting place and time in the notice. A 45-minute walk from 9.25 ends at 10.10.'),
        ],
        gaps: [prep('Nina’s reply', 'on', 'Use “on” when you’re aboard this bus.')],
        messages: [{ person: 'Nina', text: 'Good plan! See you {0} the volunteer bus tomorrow.' }],
        done: 'By bus, they should arrive around 9.50. On foot, they wouldn’t get there until 10.10.',
        say: 'Tell the group why they shouldn’t walk. Start with “We shouldn’t walk because …”',
      },
    ],
  },
  {
    id: 'detour',
    label: 'The detour',
    title: 'A tree across the road',
    when: 'Saturday morning · On the way to the station',
    art: 'roadblock',
    alt: 'A fallen tree and a barrier block the usual road to Pebble Bay Station.',
    parts: [
      {
        id: 'before',
        type: 'gaps',
        title: 'Get ready to set off.',
        intro: 'Max is cycling to the station with his dad. Mia’s mum is driving Mia and Leo there.',
        gaps: [
          slot('Max always {} a helmet when he rides his bike.', ['wear', 'wears'], 'wears', 'With “Max”, add -s in the present simple.'),
          slot('In the car, Mia and Leo must {} seat belts.', ['to wear', 'wear'], 'wear', 'After “must”, use the verb without “to”.'),
        ],
        done: 'Max sets off on his bike. Mia and Leo buckle up and Mum starts driving.',
      },
      {
        id: 'detour-signs',
        type: 'signs',
        title: 'Follow the diversion signs.',
        intro: 'A tree fell across Mill Lane in the storm. That’s Mum’s usual road to the station. Mia helps her follow the yellow signs.',
        signs: [
          {
            code: 'diversion-left', context: 'At the barrier on Mill Lane',
            gaps: [slot('{} at the junction.', ['Turn left', 'Turn right', 'Go straight on'], 'Turn left', 'Follow the arrow on the yellow sign.')],
          },
          {
            code: 'diversion-ahead', context: 'At the next junction, with a green light',
            gaps: [slot('At the traffic lights, {}.', ['turn right', 'go straight on', 'turn left'], 'go straight on', 'The arrow points straight ahead.')],
          },
        ],
        done: 'The diversion ends on Maple Street. Mum pulls into a parking bay by the supermarket. A traffic warden is on the pavement.',
      },
      {
        id: 'warden',
        type: 'dialogue',
        title: 'Ask the traffic warden.',
        art: 'warden',
        alt: 'Mum asks a traffic warden for directions while the car is parked.',
        intro: 'Mum is parked. She opens the window and asks the warden how to get to Pebble Bay Station.',
        dialogues: [
          { person: 'Mum', text: 'Excuse me. {0}' },
          { person: 'Traffic warden', text: 'Yes. Go past the supermarket to the next set of traffic lights.' },
          { person: 'Mum', text: '{1}' },
          { person: 'Traffic warden', text: 'No, turn left into Station Road. The station is on your right, opposite the sports centre.' },
          { person: 'Mum', text: '{2}' },
          { person: 'Traffic warden', text: 'Not really. It’s only a couple of minutes from here.' },
          { person: 'Mum', text: 'Thank you very much.' },
          { person: 'Traffic warden', text: 'Don’t mention it.' },
        ],
        gaps: [
          slot('Mum’s first question', ['Is it far?', 'Do I turn right at the traffic lights?', 'Do you know where the station is?'], 'Do you know where the station is?', 'Mum needs to say which place she is looking for.'),
          slot('Mum’s second question', ['Do I turn right at the traffic lights?', 'Is it far?', 'Do you know where the station is?'], 'Do I turn right at the traffic lights?', 'Look at the warden’s answer. She says to turn left.'),
          slot('Mum’s third question', ['Do you know where the station is?', 'Is it far?', 'Do I turn right at the traffic lights?'], 'Is it far?', '“A couple of minutes” tells Mum how far it is.'),
        ],
        done: 'Mum turns left at the lights, parks at the station and meets the others at 9.25 a.m.',
        say: 'Read the dialogue in pairs. Then close it and tell Mum where to turn and what she’ll see on her right.',
      },
    ],
  },
  {
    id: 'bus',
    label: 'The bus',
    title: 'All aboard!',
    when: 'Saturday · Pebble Bay Station',
    art: 'station',
    alt: 'A deep teal volunteer bus waits by the station pavement.',
    parts: [
      {
        id: 'bus-rules',
        type: 'gaps',
        title: 'Complete the driver’s reminders.',
        intro: 'Everyone is at the station. They get on the same volunteer bus. Choose the correct verb forms before the bus sets off at 9.30.',
        gaps: [
          slot('When you get on the bus, don’t {}.', ['push', 'pushes'], 'push', 'Use the base form after “don’t”.'),
          slot('If you’re standing on the bus, you should {} on to a handgrip.', ['to hold', 'hold'], 'hold', 'Use the base form after “should”.'),
          slot('You mustn’t {} out of the bus window.', ['leaning', 'lean'], 'lean', 'Use the base form after “mustn’t”.'),
          slot('You should {} the aisle clear.', ['keep', 'keeps'], 'keep', 'Keep bags out of the way. Use the base form after “should”.'),
          slot('Wait until the bus {} before you get off.', ['stop', 'stops'], 'stops', '“The bus” is singular, so the verb ends in -s.'),
        ],
        done: 'It’s 9.30. The volunteer bus leaves the station. First stop: Pine Café.',
      },
      {
        id: 'bus-signs',
        type: 'signs',
        title: 'Read the signs from the bus.',
        intro: 'The driver knows which road the café is on. Read each sign aloud and choose what the bus can or can’t do.',
        signs: [
          {
            code: 'no-left', context: 'At the junction before Beech Street',
            gaps: [
              permission('You {} turn left here.', 'can’t', 'The red line crosses the left arrow.'),
              slot('Follow the sign to Beech Street. Don’t turn left. Turn {} instead.', ['right', 'left'], 'right', 'Look at the arrow next to “Beech Street”.'),
            ],
          },
          {
            code: 'speed', context: 'On Beech Street',
            gaps: [
              permission('You {} drive at 30 mph here when it’s safe.', 'can', 'The sign gives the highest speed allowed on this road.'),
              permission('You {} drive at 40 mph here.', 'can’t', '40 mph is above the limit.'),
            ],
          },
          {
            code: 'no-entry', context: 'A side street off Beech Street',
            gaps: [permission('You {} drive into this side street.', 'can’t', 'The white bar on red means no entry.')],
          },
          {
            code: 'lights', context: 'At the next traffic lights',
            gaps: [slot('{} and wait until they turn green.', ['Stop at the traffic lights', 'Turn right', 'Go straight on'], 'Stop at the traffic lights', 'Look at which light is on.')],
          },
        ],
        done: 'When the light turns green, the bus goes straight on. It pulls into a safe bay on Beech Street near the café.',
      },
    ],
  },
  {
    id: 'cafe',
    label: 'Pine Café',
    title: 'The stop at Pine Café',
    when: 'Saturday · Beech Street',
    art: 'cafe',
    alt: 'A pine-green corner café with gloves and rubbish bags ready on the counter.',
    parts: [
      {
        id: 'cafe-find',
        type: 'choices',
        title: 'Find the café.',
        intro: 'The café is close, but Leo can’t see it from the bay. Before he gets off, the driver asks him to check where the bus can park at the rescue centre. The usual bus bay there is closed after the storm.',
        questions: [
          question('Leo asks a passer-by, “Excuse me. Is there a café around here?”', [
            'Not really. It takes 45 minutes on foot.',
            'Yes, the bank is next to the chemist’s.',
            'Yes, there’s one on the corner. It’s called Pine Café.',
          ], 2, 'Leo needs the location of a café.'),
        ],
        done: 'Leo finds the café on the corner and goes in.',
      },
      {
        id: 'cafe-pair',
        type: 'pair',
        title: 'Collect the supplies and ask where to park.',
        intro: 'The café owner says, “Here are your gloves and rubbish bags. The rescue centre is just past the bank.” Leo needs to know where the bank is and where the bus can park.',
        roles: [
          {
            name: 'Leo',
            brief: 'Ask where the bank is. Find out where the bus can park. Then thank the owner.',
            lines: ['Do you know where the bank is?', 'Is there a car park near the centre?', 'Can our bus park there?', 'Thank you very much.'],
          },
          {
            name: 'Café owner',
            brief: 'Give Leo the directions. The car park has spaces for buses.',
            lines: ['Yes, it’s next to the chemist’s.', 'Yes, there’s one opposite the rescue centre.', 'Yes, there are spaces for buses.', 'Don’t mention it.'],
          },
        ],
        questions: [
          question('Leo is back on the bus. Which message should he give the driver?', [
            'Go past the bank. The bus spaces are in the car park opposite the rescue centre.',
            'Turn into the chemist’s. Park directly outside the rescue centre.',
            'Stop at Pine Café. The centre is next to the chemist’s.',
          ], 0, 'Use the bank as a landmark and look across the road from the centre.'),
        ],
        done: 'The gloves and bags are on the bus. The driver knows where to look for the bus spaces.',
      },
    ],
  },
  {
    id: 'centre',
    label: 'Rescue centre',
    title: 'Across from the centre',
    when: 'Saturday · Just before 10 a.m.',
    art: 'centre',
    alt: 'A zebra crossing leads across the road to the turtle rescue centre.',
    parts: [
      {
        id: 'centre-signs',
        type: 'signs',
        title: 'Read the last signs before you get off.',
        intro: 'The bus goes past the bank. At the next junction it reaches the road that leads to the rescue centre.',
        signs: [
          {
            code: 'left-only', context: 'At the junction past the bank',
            gaps: [
              permission('You {} go straight on here.', 'can’t', 'The blue sign tells the driver which way to go.'),
              slot('{} here to reach the centre.', ['Turn right', 'Turn left'], 'Turn left', 'Follow the white arrow on the blue sign.'),
            ],
          },
          {
            code: 'no-parking', context: 'Outside the rescue centre',
            gaps: [permission('You {} park outside the rescue centre.', 'can’t', 'Look at the red line across the blue sign.')],
          },
          {
            code: 'parking', context: 'Opposite the rescue centre',
            gaps: [permission('You {} park in the car park opposite the centre.', 'can', 'The P sign marks the car park. Use the spaces for buses.')],
          },
        ],
        done: 'The driver parks in a bus space. The centre is just across the road.',
      },
      {
        id: 'crossing',
        type: 'order',
        title: 'Put the actions in order.',
        intro: 'The ranger is waiting outside the centre. Tap the actions in the order you’ll do them. Then give the directions to a partner.',
        items: [
          { letter: 'A', text: 'Follow the path to Turtle Beach with the ranger.' },
          { letter: 'B', text: 'Stop at the kerb, look both ways and cross at the zebra crossing when it’s safe.' },
          { letter: 'C', text: 'Meet the ranger outside the rescue centre at 10 a.m.' },
          { letter: 'D', text: 'Get off the bus and walk along the pavement to the zebra crossing.' },
        ],
        order: ['D', 'B', 'C', 'A'],
        hint: 'Start on the bus. Cross the road before you meet the ranger, then walk to the beach together.',
        done: 'You meet the ranger at 10. The group follows the path down to Turtle Beach.',
      },
    ],
  },
  {
    id: 'beach',
    label: 'Turtle Beach',
    title: 'Protect the turtle nests',
    when: 'Saturday morning · Turtle Beach',
    art: 'briefing',
    alt: 'A ranger briefs the volunteers on the open beach beside a rope protecting the dunes.',
    parts: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Complete the ranger’s briefing.',
        intro: 'Use both words in each pair. The ranger shows you where to work.',
        groups: [
          {
            title: 'What’s possible', words: 'can / can’t', gaps: [
              slot('We’ve got spare bags. You {} take another one if you need it.', ['can', 'can’t'], 'can', 'There are extra bags available.'),
              slot('There’s no tap on the beach. You {} refill your water bottle here.', ['can', 'can’t'], 'can’t', 'There is nowhere to fill a bottle.'),
            ],
          },
          {
            title: 'Rules', words: 'must / mustn’t', gaps: [
              slot('You {} wear gloves when you pick up rubbish.', ['must', 'mustn’t'], 'must', 'The gloves are required.'),
              slot('The turtle nests are behind the rope. You {} step over it.', ['must', 'mustn’t'], 'mustn’t', 'The rope marks an area that the group must stay out of.'),
            ],
          },
          {
            title: 'Advice', words: 'should / shouldn’t', gaps: [
              slot('It’s sunny today. You {} wear a hat.', ['should', 'shouldn’t'], 'should', 'The hat is a good idea in the sun.'),
              slot('Full bags are hard to carry. You {} fill yours right to the top.', ['should', 'shouldn’t'], 'shouldn’t', 'Leave some room so the bag is easier to carry.'),
            ],
          },
        ],
      },
      {
        id: 'decision',
        type: 'choices',
        title: 'Make the final decision.',
        intro: 'There’s a plastic bottle on the open beach and a plastic bag behind the rope. Leo points to the bag and says, “I’ll get it.”',
        questions: [
          question('What can you pick up?', [
            'The bag behind the rope.', 'The bottle on the open beach, with gloves on.', 'Both things straight away.',
          ], 1, 'Which piece of rubbish is on the open beach?'),
          question('What mustn’t Leo do?', [
            'He mustn’t step over the rope.', 'He mustn’t wear gloves.', 'He mustn’t tell the ranger.',
          ], 0, 'Think about what the rope protects.'),
          question('What should you do about the bag?', [
            'Ask Leo to reach for it.', 'Move the rope away from it.', 'Tell the ranger it’s there.',
          ], 2, 'The ranger can deal with things in the protected area.'),
        ],
        say: 'Say your whole reply to Leo. Use can, mustn’t and should.',
        done: 'The ranger takes care of the bag. You and the other volunteers clear the rubbish from the open beach.',
      },
    ],
  },
];

export const epilogue = {
  title: 'They made it to the sea!',
  when: 'Saturday evening · A message from the ranger',
  art: 'hatchlings',
  alt: 'Three tiny sea turtles make their way across wet sand into the sea at dusk.',
  text: 'The volunteers fill their last bag and leave the beach clean. That evening, the ranger sends a video to the group chat. Tiny turtles come out of the sand and make their way to the sea.',
  message: 'Look! They’re in the water!',
};

export function gapsFor(part) {
  if (part.signs) return part.signs.flatMap(sign => sign.gaps);
  if (part.groups) return part.groups.flatMap(group => group.gaps);
  return part.gaps ?? [];
}
