const ADJECTIVES = [
    'happy', 'brave', 'calm', 'swift', 'bright',
    'clever', 'gentle', 'lucky', 'proud', 'kind',
    'bold', 'cool', 'eager', 'fair', 'grand',
    'keen', 'lively', 'merry', 'noble', 'quick',
    'sharp', 'smart', 'sunny', 'warm', 'wise',
    'agile', 'crisp', 'daring', 'fancy', 'golden',
    'humble', 'jolly', 'magic', 'neat', 'orange',
    'pink', 'quiet', 'rapid', 'royal', 'silver',
    'tiny', 'ultra', 'vivid', 'witty', 'young',
    'azure', 'cosmic', 'fresh', 'polar', 'stellar',
];

const NOUNS = [
    'hippo', 'tiger', 'eagle', 'panda', 'whale',
    'fox', 'otter', 'wolf', 'koala', 'falcon',
    'dolphin', 'parrot', 'rabbit', 'turtle', 'penguin',
    'owl', 'hawk', 'shark', 'kitten', 'puppy',
    'bear', 'deer', 'duck', 'frog', 'goose',
    'horse', 'lion', 'monkey', 'mouse', 'raven',
    'robin', 'salmon', 'seal', 'snake', 'sparrow',
    'squid', 'stork', 'swan', 'toucan', 'zebra',
    'badger', 'crane', 'finch', 'gecko', 'heron',
    'lemur', 'lynx', 'mole', 'newt', 'quail',
];

export function generateWordId() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${adj}-${noun}`;
}

export function validateWordId(id) {
    return /^[a-z0-9][a-z0-9-]{0,28}[a-z0-9]$/.test(id);
}
