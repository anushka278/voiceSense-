import type { MemoryGame, AttentionGame, LanguageGame, ProcessingSpeedGame, CategorySortingGame, PatternCompletionGame } from '@/types';

export const memoryGames: MemoryGame[] = [
  {
    id: 'memory-1',
    type: 'story',
    content: "Last Sunday, Margaret went to the farmer's market with her daughter Sarah. They bought fresh tomatoes, a loaf of sourdough bread, and some yellow sunflowers. On the way home, they stopped at the old bakery on Maple Street for Margaret's favorite lemon cookies.",
    questions: [
      { question: "What day did Margaret go to the market?", correctAnswer: "Sunday" },
      { question: "Who went with Margaret?", correctAnswer: "Sarah" },
      { question: "What kind of bread did they buy?", correctAnswer: "sourdough" },
      { question: "What street was the bakery on?", correctAnswer: "Maple Street" }
    ]
  },
  {
    id: 'memory-2',
    type: 'story',
    content: "Every morning, Robert takes his golden retriever named Buddy for a walk in the park near his house. They usually walk past the old oak tree and around the pond where the ducks live. Robert always brings a thermos of coffee and sits on his favorite green bench to watch the sunrise.",
    questions: [
      { question: "What is the dog's name?", correctAnswer: "Buddy" },
      { question: "What kind of tree do they walk past?", correctAnswer: "oak" },
      { question: "What does Robert bring with him?", correctAnswer: "coffee" },
      { question: "What color is his favorite bench?", correctAnswer: "green" }
    ]
  },
  {
    id: 'memory-3',
    type: 'story',
    content: "Helen celebrated her birthday last Tuesday at the Italian restaurant downtown. Her three grandchildren - Tommy, Emma, and little Jack - surprised her with a chocolate cake and a bouquet of pink roses. They gave her a beautiful silver photo frame with a picture from their beach vacation last summer.",
    questions: [
      { question: "When was Helen's birthday?", correctAnswer: "Tuesday" },
      { question: "What type of restaurant did they go to?", correctAnswer: "Italian" },
      { question: "What color were the roses?", correctAnswer: "pink" },
      { question: "Where was the photo from?", correctAnswer: "beach vacation" }
    ]
  },
  {
    id: 'memory-4',
    type: 'list',
    content: "Please listen carefully to this shopping list: milk, eggs, butter, apples, bread, cheese, orange juice, and chicken.",
    questions: [
      { question: "What fruit was on the list?", correctAnswer: "apples" },
      { question: "What dairy products were mentioned?", correctAnswer: "milk, butter, cheese" },
      { question: "What kind of juice was on the list?", correctAnswer: "orange juice" },
      { question: "What meat was mentioned?", correctAnswer: "chicken" }
    ]
  },
  {
    id: 'memory-5',
    type: 'story',
    content: "Dr. Patterson has been the family doctor for thirty years. His office is on the third floor of the red brick building on Center Avenue. He has a fish tank in the waiting room with colorful tropical fish. His nurse, Mrs. Chen, always remembers everyone's birthday.",
    questions: [
      { question: "How long has Dr. Patterson been the family doctor?", correctAnswer: "thirty years" },
      { question: "What floor is his office on?", correctAnswer: "third floor" },
      { question: "What's in the waiting room?", correctAnswer: "fish tank" },
      { question: "What is the nurse's name?", correctAnswer: "Mrs. Chen" }
    ]
  }
];

export const attentionGames: AttentionGame[] = [
  {
    id: 'attention-1',
    type: 'word_detection',
    content: "The cat sat on the mat. The mat was red. The cat was very happy on the red mat. Then the cat jumped off the mat and walked away.",
    targetWord: "mat",
    correctCount: 4
  },
  {
    id: 'attention-2',
    type: 'word_detection',
    content: "Birds sing in the morning. The morning sun is bright. Every morning I wake up to hear the birds. What a beautiful morning it is today.",
    targetWord: "morning",
    correctCount: 4
  },
  {
    id: 'attention-3',
    type: 'word_detection',
    content: "The garden has many flowers. Red flowers, yellow flowers, and blue flowers bloom in the garden. My grandmother loved flowers. She would pick fresh flowers every day.",
    targetWord: "flowers",
    correctCount: 5
  },
  {
    id: 'attention-4',
    type: 'counting',
    content: "One apple, two oranges, three bananas, one pear, two apples, one orange, three pears, and two bananas.",
    targetWord: "apple",
    correctCount: 3
  },
  {
    id: 'attention-5',
    type: 'word_detection',
    content: "The house on the hill has a big window. Through the window you can see the garden. The window faces east, so the sun shines through the window every morning.",
    targetWord: "window",
    correctCount: 4
  }
];

export const languageGames: LanguageGame[] = [
  {
    id: 'language-1',
    type: 'sentence_completion',
    prompt: "The sun rises in the east and sets in the...",
    expectedResponses: ['west'],
    difficultyLevel: 1
  },
  {
    id: 'language-2',
    type: 'sentence_completion',
    prompt: "A bird has feathers, but a fish has...",
    expectedResponses: ['scales', 'fins'],
    difficultyLevel: 1
  },
  {
    id: 'language-3',
    type: 'sentence_completion',
    prompt: "We use our eyes to see and our ears to...",
    expectedResponses: ['hear', 'listen'],
    difficultyLevel: 1
  },
  {
    id: 'language-4',
    type: 'naming',
    prompt: "Name three things you might find in a kitchen.",
    expectedResponses: ['stove', 'refrigerator', 'sink', 'table', 'chair', 'pot', 'pan', 'plate', 'cup', 'fork', 'knife', 'spoon', 'oven', 'microwave', 'toaster'],
    difficultyLevel: 1
  },
  {
    id: 'language-5',
    type: 'naming',
    prompt: "Name three different animals that can fly.",
    expectedResponses: ['bird', 'butterfly', 'bee', 'bat', 'eagle', 'sparrow', 'robin', 'owl', 'parrot', 'duck', 'goose', 'crow', 'hawk', 'pigeon', 'hummingbird'],
    difficultyLevel: 1
  },
  {
    id: 'language-6',
    type: 'sentence_completion',
    prompt: "Roses are red, violets are...",
    expectedResponses: ['blue'],
    difficultyLevel: 1
  },
  {
    id: 'language-7',
    type: 'description',
    prompt: "Describe what you see when you look out a window on a sunny day.",
    expectedResponses: ['sky', 'sun', 'trees', 'clouds', 'grass', 'light', 'bright'],
    difficultyLevel: 2
  },
  {
    id: 'language-8',
    type: 'naming',
    prompt: "Name three things that are typically the color green.",
    expectedResponses: ['grass', 'leaves', 'trees', 'frogs', 'peas', 'cucumbers', 'broccoli', 'lettuce', 'apples', 'plants'],
    difficultyLevel: 1
  }
];

export const processingSpeedGames: ProcessingSpeedGame[] = [
  {
    id: 'speed-1',
    type: 'category_naming',
    category: 'fruits',
    timeLimit: 30,
    minimumResponses: 5
  },
  {
    id: 'speed-2',
    type: 'category_naming',
    category: 'animals',
    timeLimit: 30,
    minimumResponses: 5
  },
  {
    id: 'speed-3',
    type: 'category_naming',
    category: 'colors',
    timeLimit: 20,
    minimumResponses: 6
  },
  {
    id: 'speed-4',
    type: 'object_naming',
    category: 'things in a living room',
    timeLimit: 30,
    minimumResponses: 5
  },
  {
    id: 'speed-5',
    type: 'word_association',
    category: 'words that rhyme with "day"',
    timeLimit: 25,
    minimumResponses: 4
  },
  {
    id: 'speed-6',
    type: 'category_naming',
    category: 'countries',
    timeLimit: 30,
    minimumResponses: 4
  },
  {
    id: 'speed-7',
    type: 'object_naming',
    category: 'things you wear',
    timeLimit: 25,
    minimumResponses: 5
  }
];

// Get a random game of each type
export function getRandomMemoryGame(): MemoryGame {
  return memoryGames[Math.floor(Math.random() * memoryGames.length)];
}

export function getRandomAttentionGame(): AttentionGame {
  return attentionGames[Math.floor(Math.random() * attentionGames.length)];
}

export function getRandomLanguageGame(): LanguageGame {
  return languageGames[Math.floor(Math.random() * languageGames.length)];
}

export function getRandomProcessingSpeedGame(): ProcessingSpeedGame {
  return processingSpeedGames[Math.floor(Math.random() * processingSpeedGames.length)];
}

export const categorySortingGames: CategorySortingGame[] = [
  {
    id: 'category-1',
    type: 'single_choice',
    question: 'Which one is a vegetable?',
    options: ['carrot', 'airplane', 'book'],
    correctAnswer: 'carrot',
    category: 'vegetables',
    difficultyLevel: 1
  },
  {
    id: 'category-2',
    type: 'single_choice',
    question: 'Which one is a fruit?',
    options: ['banana', 'car', 'table'],
    correctAnswer: 'banana',
    category: 'fruits',
    difficultyLevel: 1
  },
  {
    id: 'category-3',
    type: 'single_choice',
    question: 'Which one is an animal?',
    options: ['dog', 'chair', 'pencil'],
    correctAnswer: 'dog',
    category: 'animals',
    difficultyLevel: 1
  },
  {
    id: 'category-4',
    type: 'single_choice',
    question: 'Which one is a color?',
    options: ['red', 'house', 'running'],
    correctAnswer: 'red',
    category: 'colors',
    difficultyLevel: 1
  },
  {
    id: 'category-5',
    type: 'single_choice',
    question: 'Which one is a body part?',
    options: ['hand', 'cloud', 'music'],
    correctAnswer: 'hand',
    category: 'body parts',
    difficultyLevel: 1
  },
  {
    id: 'category-6',
    type: 'single_choice',
    question: 'Which one is a tool?',
    options: ['hammer', 'flower', 'ocean'],
    correctAnswer: 'hammer',
    category: 'tools',
    difficultyLevel: 2
  },
  {
    id: 'category-7',
    type: 'single_choice',
    question: 'Which one is a type of weather?',
    options: ['rain', 'computer', 'guitar'],
    correctAnswer: 'rain',
    category: 'weather',
    difficultyLevel: 2
  },
  {
    id: 'category-8',
    type: 'single_choice',
    question: 'Which one is something you wear?',
    options: ['shirt', 'mountain', 'river'],
    correctAnswer: 'shirt',
    category: 'clothing',
    difficultyLevel: 2
  },
  {
    id: 'category-9',
    type: 'single_choice',
    question: 'Which one is a type of transportation?',
    options: ['bicycle', 'tree', 'song'],
    correctAnswer: 'bicycle',
    category: 'transportation',
    difficultyLevel: 2
  },
  {
    id: 'category-10',
    type: 'single_choice',
    question: 'Which one is a kitchen item?',
    options: ['spoon', 'star', 'wind'],
    correctAnswer: 'spoon',
    category: 'kitchen items',
    difficultyLevel: 2
  },
  {
    id: 'category-11',
    type: 'single_choice',
    question: 'Which one is a musical instrument?',
    options: ['piano', 'mountain', 'cloud'],
    correctAnswer: 'piano',
    category: 'musical instruments',
    difficultyLevel: 2
  },
  {
    id: 'category-12',
    type: 'single_choice',
    question: 'Which one is a type of building?',
    options: ['hospital', 'butterfly', 'ocean'],
    correctAnswer: 'hospital',
    category: 'buildings',
    difficultyLevel: 2
  },
  {
    id: 'category-13',
    type: 'single_choice',
    question: 'Which one is a type of tree?',
    options: ['oak', 'television', 'dance'],
    correctAnswer: 'oak',
    category: 'trees',
    difficultyLevel: 2
  },
  {
    id: 'category-14',
    type: 'single_choice',
    question: 'Which one is a type of bird?',
    options: ['robin', 'computer', 'mountain'],
    correctAnswer: 'robin',
    category: 'birds',
    difficultyLevel: 2
  },
  {
    id: 'category-15',
    type: 'single_choice',
    question: 'Which one is a type of sport?',
    options: ['tennis', 'moon', 'pencil'],
    correctAnswer: 'tennis',
    category: 'sports',
    difficultyLevel: 2
  }
];

export const patternCompletionGames: PatternCompletionGame[] = [
  {
    id: 'pattern-1',
    type: 'color',
    pattern: ['red', 'blue', 'red', 'blue'],
    missingIndex: 4,
    options: ['red', 'green', 'yellow'],
    correctAnswer: 'red'
  },
  {
    id: 'pattern-2',
    type: 'color',
    pattern: ['green', 'yellow', 'green', 'yellow'],
    missingIndex: 4,
    options: ['green', 'blue', 'red'],
    correctAnswer: 'green'
  },
  {
    id: 'pattern-3',
    type: 'number',
    pattern: ['one', 'two', 'three', 'one', 'two'],
    missingIndex: 5,
    options: ['three', 'four', 'five'],
    correctAnswer: 'three'
  },
  {
    id: 'pattern-4',
    type: 'number',
    pattern: ['two', 'four', 'six', 'two', 'four'],
    missingIndex: 5,
    options: ['six', 'eight', 'ten'],
    correctAnswer: 'six'
  },
  {
    id: 'pattern-5',
    type: 'word',
    pattern: ['cat', 'dog', 'cat', 'dog'],
    missingIndex: 4,
    options: ['cat', 'bird', 'fish'],
    correctAnswer: 'cat'
  },
  {
    id: 'pattern-6',
    type: 'word',
    pattern: ['apple', 'banana', 'apple', 'banana'],
    missingIndex: 4,
    options: ['apple', 'orange', 'grape'],
    correctAnswer: 'apple'
  },
  {
    id: 'pattern-7',
    type: 'color',
    pattern: ['blue', 'red', 'blue', 'red', 'blue'],
    missingIndex: 5,
    options: ['red', 'yellow', 'green'],
    correctAnswer: 'red'
  },
  {
    id: 'pattern-8',
    type: 'number',
    pattern: ['one', 'one', 'two', 'one', 'one'],
    missingIndex: 5,
    options: ['two', 'three', 'four'],
    correctAnswer: 'two'
  },
  {
    id: 'pattern-9',
    type: 'word',
    pattern: ['up', 'down', 'up', 'down'],
    missingIndex: 4,
    options: ['up', 'left', 'right'],
    correctAnswer: 'up'
  },
  {
    id: 'pattern-10',
    type: 'color',
    pattern: ['yellow', 'red', 'yellow', 'red'],
    missingIndex: 4,
    options: ['yellow', 'blue', 'green'],
    correctAnswer: 'yellow'
  }
];

export function getRandomCategorySortingGame(): CategorySortingGame {
  return categorySortingGames[Math.floor(Math.random() * categorySortingGames.length)];
}

export function getRandomPatternCompletionGame(): PatternCompletionGame {
  return patternCompletionGames[Math.floor(Math.random() * patternCompletionGames.length)];
}

// Sample insights for demo
export const sampleInsights = [
  {
    type: 'language' as const,
    severity: 'info' as const,
    title: 'Morning Clarity Strong',
    description: 'Language complexity scores are consistently 15% higher during morning conversations compared to evening.',
    recommendation: 'Consider scheduling important calls and activities before noon.'
  },
  {
    type: 'memory' as const,
    severity: 'info' as const,
    title: 'Memory Recall Stable',
    description: 'Memory recall performance has remained steady over the past two weeks with accuracy averaging 78%.',
    recommendation: 'Continue with current memory activities to maintain this positive trend.'
  },
  {
    type: 'pattern' as const,
    severity: 'notable' as const,
    title: 'Evening Repetition Pattern',
    description: 'Increased repetition of questions and phrases detected in conversations after 5 PM.',
    recommendation: 'This is a common pattern. Consider earlier dinner times and calming evening routines.'
  },
  {
    type: 'emotion' as const,
    severity: 'info' as const,
    title: 'Calm Engagement Dominant',
    description: 'Emotional state analysis shows calm engagement as the primary state in 65% of interactions.',
    recommendation: 'The current interaction patterns are creating a comfortable experience.'
  },
  {
    type: 'attention' as const,
    severity: 'info' as const,
    title: 'Focus Duration Improving',
    description: 'Attention span during activities has increased by 12% over the past month.',
    recommendation: 'The brain games are having a positive effect on sustained attention.'
  }
];

