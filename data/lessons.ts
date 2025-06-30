export interface Lesson {
  id: string;
  title: string;
  trackId: string;
  duration: number; // in minutes
  reward: number; // SkillCoins
  objective: string;
  concepts: Concept[];
  quiz: QuizQuestion[];
  exercise?: Exercise;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  example?: string;
  codeExample?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Exercise {
  title: string;
  description: string;
  task: string;
  hints?: string[];
  solution?: string;
}

const lessons: Lesson[] = [
  // Python Programming Track
  {
    id: 'python-basics-1',
    title: 'Python Fundamentals',
    trackId: 'python-programming',
    duration: 25,
    reward: 15,
    objective: 'Learn the basic syntax and structure of Python programming language',
    concepts: [
      {
        id: 'variables',
        title: 'Variables and Data Types',
        description: 'Variables are containers for storing data values. Python has various data types including strings, integers, floats, and booleans.',
        example: 'Think of variables like labeled boxes where you can store different types of items.',
        codeExample: 'name = "Alice"\nage = 25\nheight = 5.6\nis_student = True'
      },
      {
        id: 'operators',
        title: 'Basic Operators',
        description: 'Operators are used to perform operations on variables and values. Python includes arithmetic, comparison, and logical operators.',
        example: 'Just like math, you can add, subtract, multiply, and divide numbers in Python.',
        codeExample: 'result = 10 + 5\nprint(result)  # Output: 15'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which of the following is a valid variable name in Python?',
        options: ['2name', 'name-2', 'name_2', 'name 2'],
        correctAnswer: 2,
        explanation: 'Variable names in Python can contain letters, numbers, and underscores, but cannot start with a number or contain spaces or hyphens.'
      },
      {
        id: 'q2',
        question: 'What data type is the value True in Python?',
        options: ['string', 'integer', 'boolean', 'float'],
        correctAnswer: 2,
        explanation: 'True (and False) are boolean values in Python, representing logical true and false states.'
      }
    ],
    exercise: {
      title: 'Create Your First Variables',
      description: 'Practice creating variables with different data types.',
      task: 'Create variables for your name, age, and whether you like programming. Print each variable.',
      hints: [
        'Use quotes for string values',
        'Numbers don\'t need quotes',
        'Use True or False for boolean values'
      ],
      solution: 'my_name = "Your Name"\nmy_age = 20\nlikes_programming = True\nprint(my_name)\nprint(my_age)\nprint(likes_programming)'
    }
  },
  {
    id: 'python-control-flow',
    title: 'Control Flow',
    trackId: 'python-programming',
    duration: 30,
    reward: 20,
    objective: 'Master conditional statements and loops in Python',
    concepts: [
      {
        id: 'if-statements',
        title: 'If Statements',
        description: 'If statements allow you to execute code conditionally based on whether a condition is true or false.',
        example: 'Like making decisions in real life - "If it\'s raining, take an umbrella"',
        codeExample: 'age = 18\nif age >= 18:\n    print("You can vote!")\nelse:\n    print("Too young to vote")'
      },
      {
        id: 'loops',
        title: 'For and While Loops',
        description: 'Loops allow you to repeat code multiple times. For loops iterate over sequences, while loops continue until a condition is false.',
        example: 'Like doing jumping jacks - repeat the same action multiple times',
        codeExample: 'for i in range(5):\n    print(f"Count: {i}")\n\ncount = 0\nwhile count < 3:\n    print(count)\n    count += 1'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What will this code print?\nif 5 > 3:\n    print("A")\nelse:\n    print("B")',
        options: ['A', 'B', 'Both A and B', 'Nothing'],
        correctAnswer: 0,
        explanation: 'Since 5 is greater than 3, the condition is true, so "A" will be printed.'
      }
    ],
    exercise: {
      title: 'Number Guessing Logic',
      description: 'Create a simple number checking program.',
      task: 'Write code that checks if a number is positive, negative, or zero, and prints an appropriate message.',
      hints: [
        'Use if, elif, and else statements',
        'Compare the number to 0',
        'Print different messages for each case'
      ]
    }
  },
  {
    id: 'python-functions',
    title: 'Functions and Modules',
    trackId: 'python-programming',
    duration: 35,
    reward: 25,
    objective: 'Learn to create reusable code with functions and organize code with modules',
    concepts: [
      {
        id: 'functions',
        title: 'Defining Functions',
        description: 'Functions are reusable blocks of code that perform specific tasks. They help organize code and avoid repetition.',
        example: 'Like a recipe - you define it once and can use it many times',
        codeExample: 'def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Alice")\nprint(message)'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctAnswer: 1,
        explanation: 'The "def" keyword is used to define functions in Python.'
      }
    ],
    exercise: {
      title: 'Calculator Function',
      description: 'Create a function that performs basic arithmetic.',
      task: 'Write a function called "add_numbers" that takes two parameters and returns their sum.',
      hints: [
        'Use the def keyword',
        'Include two parameters',
        'Use the return statement'
      ]
    }
  },

  // Excel Mastery Track
  {
    id: 'excel-basics',
    title: 'Excel Fundamentals',
    trackId: 'excel-mastery',
    duration: 20,
    reward: 12,
    objective: 'Master the basic interface and navigation of Microsoft Excel',
    concepts: [
      {
        id: 'interface',
        title: 'Excel Interface',
        description: 'Learn about cells, rows, columns, worksheets, and the ribbon interface in Excel.',
        example: 'Think of Excel as a digital grid where each box (cell) can hold data, formulas, or functions.'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the intersection of a row and column called in Excel?',
        options: ['Box', 'Cell', 'Square', 'Field'],
        correctAnswer: 1,
        explanation: 'A cell is the intersection of a row and column in Excel, identified by coordinates like A1, B2, etc.'
      }
    ],
    exercise: {
      title: 'Basic Data Entry',
      description: 'Practice entering and formatting data in Excel.',
      task: 'Create a simple budget spreadsheet with categories and amounts.',
      hints: [
        'Use column headers',
        'Format numbers as currency',
        'Use SUM function for totals'
      ]
    }
  },
  {
    id: 'excel-formulas',
    title: 'Formulas and Functions',
    trackId: 'excel-mastery',
    duration: 30,
    reward: 18,
    objective: 'Learn to create powerful formulas and use built-in functions',
    concepts: [
      {
        id: 'basic-formulas',
        title: 'Basic Formulas',
        description: 'Formulas in Excel start with = and can perform calculations using cell references and operators.',
        example: 'Like a calculator that can reference other cells and update automatically',
        codeExample: '=A1+B1\n=SUM(A1:A10)\n=AVERAGE(B1:B5)'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What symbol must every Excel formula start with?',
        options: ['+', '=', '*', '@'],
        correctAnswer: 1,
        explanation: 'All Excel formulas must start with the equals sign (=) to tell Excel that what follows is a formula.'
      }
    ],
    exercise: {
      title: 'Sales Calculator',
      description: 'Create formulas to calculate sales totals and commissions.',
      task: 'Build a spreadsheet that calculates total sales and commission percentages.',
      hints: [
        'Use multiplication for percentages',
        'Reference cells instead of hard-coding values',
        'Use absolute references when needed'
      ]
    }
  },
  {
    id: 'excel-pivot-tables',
    title: 'Pivot Tables and Data Analysis',
    trackId: 'excel-mastery',
    duration: 40,
    reward: 22,
    objective: 'Master pivot tables for powerful data analysis and reporting',
    concepts: [
      {
        id: 'pivot-tables',
        title: 'Creating Pivot Tables',
        description: 'Pivot tables allow you to summarize, analyze, and present large amounts of data quickly and efficiently.',
        example: 'Like having a smart assistant that can instantly reorganize and summarize your data in different ways'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the main purpose of a pivot table?',
        options: ['Data entry', 'Data analysis and summarization', 'Chart creation', 'Formula calculation'],
        correctAnswer: 1,
        explanation: 'Pivot tables are primarily used for analyzing and summarizing large datasets to identify patterns and insights.'
      }
    ],
    exercise: {
      title: 'Sales Analysis',
      description: 'Create a pivot table to analyze sales data by region and product.',
      task: 'Build a pivot table that shows total sales by region and identifies top-performing products.',
      hints: [
        'Drag fields to appropriate areas',
        'Use filters to focus on specific data',
        'Format numbers for better readability'
      ]
    }
  },

  // Digital Marketing Track (Premium)
  {
    id: 'marketing-fundamentals',
    title: 'Digital Marketing Basics',
    trackId: 'digital-marketing',
    duration: 25,
    reward: 15,
    objective: 'Understand the core concepts and channels of digital marketing',
    concepts: [
      {
        id: 'digital-channels',
        title: 'Digital Marketing Channels',
        description: 'Learn about various digital marketing channels including SEO, social media, email marketing, and paid advertising.',
        example: 'Like having multiple roads to reach your customers - each channel serves different purposes and audiences'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which of the following is NOT a digital marketing channel?',
        options: ['SEO', 'Social Media', 'Email Marketing', 'Print Advertising'],
        correctAnswer: 3,
        explanation: 'Print advertising is a traditional marketing channel, not a digital one.'
      }
    ],
    exercise: {
      title: 'Marketing Strategy Plan',
      description: 'Create a basic digital marketing strategy for a fictional business.',
      task: 'Outline a marketing plan that includes at least 3 digital channels and their purposes.',
      hints: [
        'Consider your target audience',
        'Match channels to business goals',
        'Think about budget allocation'
      ]
    }
  },
  {
    id: 'seo-basics',
    title: 'Search Engine Optimization',
    trackId: 'digital-marketing',
    duration: 35,
    reward: 20,
    objective: 'Learn SEO fundamentals to improve website visibility in search engines',
    concepts: [
      {
        id: 'keyword-research',
        title: 'Keyword Research',
        description: 'Understanding how to find and target the right keywords that your audience is searching for.',
        example: 'Like learning the language your customers use when looking for your products or services'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What does SEO stand for?',
        options: ['Search Engine Optimization', 'Social Engagement Online', 'Site Enhancement Operations', 'Search Engagement Optimization'],
        correctAnswer: 0,
        explanation: 'SEO stands for Search Engine Optimization, the practice of improving website visibility in search engine results.'
      }
    ],
    exercise: {
      title: 'Keyword Analysis',
      description: 'Conduct keyword research for a specific business niche.',
      task: 'Identify 10 relevant keywords for a local restaurant and categorize them by search intent.',
      hints: [
        'Think about what customers would search for',
        'Consider location-based keywords',
        'Include both broad and specific terms'
      ]
    }
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Strategy',
    trackId: 'digital-marketing',
    duration: 30,
    reward: 18,
    objective: 'Develop effective social media marketing strategies across different platforms',
    concepts: [
      {
        id: 'platform-strategy',
        title: 'Platform-Specific Strategies',
        description: 'Each social media platform has unique characteristics, audiences, and best practices for marketing.',
        example: 'Like speaking different languages - what works on Instagram might not work on LinkedIn'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which social media platform is best for B2B marketing?',
        options: ['Instagram', 'TikTok', 'LinkedIn', 'Snapchat'],
        correctAnswer: 2,
        explanation: 'LinkedIn is the premier platform for B2B marketing due to its professional user base and business-focused features.'
      }
    ],
    exercise: {
      title: 'Social Media Calendar',
      description: 'Create a content calendar for a brand\'s social media presence.',
      task: 'Plan a week\'s worth of social media posts across 2 platforms with varied content types.',
      hints: [
        'Mix promotional and educational content',
        'Consider optimal posting times',
        'Include engagement-driving elements'
      ]
    }
  },

  // AI Fundamentals Track (Premium)
  {
    id: 'ai-introduction',
    title: 'Introduction to Artificial Intelligence',
    trackId: 'ai-fundamentals',
    duration: 30,
    reward: 25,
    objective: 'Understand the basic concepts and applications of artificial intelligence',
    concepts: [
      {
        id: 'ai-types',
        title: 'Types of AI',
        description: 'Learn about different types of AI including narrow AI, general AI, and the current state of AI technology.',
        example: 'Like different types of intelligence - some AI is specialized (like chess-playing AI) while others are more general-purpose'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What type of AI do we primarily have today?',
        options: ['Artificial General Intelligence', 'Narrow AI', 'Super AI', 'Quantum AI'],
        correctAnswer: 1,
        explanation: 'Most current AI systems are narrow AI, designed to perform specific tasks rather than general intelligence.'
      }
    ],
    exercise: {
      title: 'AI Application Analysis',
      description: 'Identify and categorize different AI applications in daily life.',
      task: 'List 5 AI applications you use regularly and explain how they work.',
      hints: [
        'Think about recommendation systems',
        'Consider voice assistants',
        'Look at image recognition features'
      ]
    }
  },
  {
    id: 'machine-learning-basics',
    title: 'Machine Learning Fundamentals',
    trackId: 'ai-fundamentals',
    duration: 40,
    reward: 30,
    objective: 'Learn the core concepts of machine learning and its different approaches',
    concepts: [
      {
        id: 'ml-types',
        title: 'Types of Machine Learning',
        description: 'Understand supervised, unsupervised, and reinforcement learning approaches and their applications.',
        example: 'Like different ways of learning - with a teacher (supervised), discovering patterns yourself (unsupervised), or learning through trial and error (reinforcement)'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which type of machine learning uses labeled training data?',
        options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Deep Learning'],
        correctAnswer: 1,
        explanation: 'Supervised learning uses labeled training data where the correct answers are provided during training.'
      }
    ],
    exercise: {
      title: 'ML Problem Classification',
      description: 'Classify different problems by their machine learning approach.',
      task: 'Given 5 real-world problems, determine whether they would use supervised, unsupervised, or reinforcement learning.',
      hints: [
        'Consider if you have labeled data',
        'Think about the goal of the system',
        'Determine if it\'s about prediction, discovery, or optimization'
      ]
    }
  },
  {
    id: 'neural-networks-intro',
    title: 'Neural Networks and Deep Learning',
    trackId: 'ai-fundamentals',
    duration: 45,
    reward: 35,
    objective: 'Understand how neural networks work and their role in modern AI',
    concepts: [
      {
        id: 'neural-networks',
        title: 'How Neural Networks Work',
        description: 'Learn about artificial neurons, layers, and how neural networks process information to make predictions.',
        example: 'Like a simplified version of how our brain works - interconnected nodes that process and pass information'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the basic building block of a neural network?',
        options: ['Neuron', 'Layer', 'Weight', 'Bias'],
        correctAnswer: 0,
        explanation: 'The neuron (or node) is the basic building block of neural networks, inspired by biological neurons.'
      }
    ],
    exercise: {
      title: 'Neural Network Design',
      description: 'Design a simple neural network for a specific problem.',
      task: 'Describe the architecture of a neural network that could classify images of cats and dogs.',
      hints: [
        'Consider input layer size',
        'Think about hidden layers',
        'Determine output layer structure'
      ]
    }
  }
];

export const getLessonById = (id: string): Lesson | null => {
  return lessons.find(lesson => lesson.id === id) || null;
};

export const getTrackLessons = (trackId: string): Lesson[] => {
  return lessons.filter(lesson => lesson.trackId === trackId);
};

export const getAllLessons = (): Lesson[] => {
  return lessons;
};