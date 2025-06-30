import { Job, SuccessStory, InterviewQuestion, CompanyInfo } from '@/types/jobs';

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Python Developer',
    company: 'TechCorp',
    companyLogo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    requiredSkills: ['Python Programming', 'Data Analysis'],
    preferredSkills: ['Machine Learning', 'SQL'],
    experienceLevel: 'mid',
    description: 'Join our dynamic team as a Python Developer and work on cutting-edge projects that impact millions of users.',
    responsibilities: [
      'Develop and maintain Python applications',
      'Collaborate with cross-functional teams',
      'Write clean, efficient, and well-documented code',
      'Participate in code reviews and technical discussions'
    ],
    requirements: [
      '3+ years of Python development experience',
      'Strong understanding of data structures and algorithms',
      'Experience with web frameworks like Django or Flask',
      'Knowledge of database systems'
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      'Professional development budget'
    ],
    applicationCost: 25,
    postedDate: '2024-01-15T00:00:00Z',
    applicationDeadline: '2024-02-15T00:00:00Z',
    isPartnership: true,
    companySize: '100-500',
    industry: 'Technology',
    tags: ['Python', 'Backend', 'API Development']
  },
  {
    id: 'job-2',
    title: 'Data Analyst',
    company: 'DataInsights Inc',
    companyLogo: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'New York, NY',
    locationType: 'remote',
    salaryMin: 65000,
    salaryMax: 90000,
    currency: 'USD',
    requiredSkills: ['Excel Mastery', 'Data Analysis'],
    preferredSkills: ['Python Programming', 'SQL'],
    experienceLevel: 'entry',
    description: 'Analyze complex datasets to drive business decisions and create actionable insights.',
    responsibilities: [
      'Analyze large datasets using Excel and Python',
      'Create comprehensive reports and dashboards',
      'Present findings to stakeholders',
      'Identify trends and patterns in data'
    ],
    requirements: [
      'Bachelor\'s degree in relevant field',
      'Advanced Excel skills including pivot tables',
      'Strong analytical and problem-solving skills',
      'Excellent communication skills'
    ],
    benefits: [
      'Remote work flexibility',
      'Health insurance',
      'Learning and development opportunities',
      'Annual bonus potential'
    ],
    applicationCost: 20,
    postedDate: '2024-01-10T00:00:00Z',
    isPartnership: false,
    companySize: '50-100',
    industry: 'Analytics',
    tags: ['Data Analysis', 'Excel', 'Remote']
  },
  {
    id: 'job-3',
    title: 'Digital Marketing Specialist',
    company: 'GrowthLab',
    companyLogo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'Austin, TX',
    locationType: 'onsite',
    salaryMin: 55000,
    salaryMax: 75000,
    currency: 'USD',
    requiredSkills: ['Digital Marketing', 'SEO'],
    preferredSkills: ['Social Media Marketing', 'Content Creation'],
    experienceLevel: 'mid',
    description: 'Drive digital marketing campaigns and grow our online presence across multiple channels.',
    responsibilities: [
      'Develop and execute digital marketing strategies',
      'Manage SEO and SEM campaigns',
      'Create engaging content for social media',
      'Analyze campaign performance and ROI'
    ],
    requirements: [
      '2+ years of digital marketing experience',
      'Proven track record with SEO optimization',
      'Experience with Google Analytics and Ads',
      'Strong writing and communication skills'
    ],
    benefits: [
      'Competitive salary',
      'Health and wellness benefits',
      'Creative work environment',
      'Career growth opportunities'
    ],
    applicationCost: 30,
    postedDate: '2024-01-12T00:00:00Z',
    isPartnership: true,
    companySize: '20-50',
    industry: 'Marketing',
    tags: ['Digital Marketing', 'SEO', 'Growth']
  },
  {
    id: 'job-4',
    title: 'AI Research Engineer',
    company: 'FutureAI Labs',
    companyLogo: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'Seattle, WA',
    locationType: 'hybrid',
    salaryMin: 120000,
    salaryMax: 180000,
    currency: 'USD',
    requiredSkills: ['AI Fundamentals', 'Machine Learning', 'Python Programming'],
    preferredSkills: ['Deep Learning', 'Research'],
    experienceLevel: 'senior',
    description: 'Lead cutting-edge AI research and develop next-generation machine learning models.',
    responsibilities: [
      'Conduct advanced AI research',
      'Develop and implement ML algorithms',
      'Publish research papers',
      'Collaborate with academic institutions'
    ],
    requirements: [
      'PhD in AI, ML, or related field',
      '5+ years of AI research experience',
      'Strong publication record',
      'Expertise in deep learning frameworks'
    ],
    benefits: [
      'Competitive compensation package',
      'Research budget and conference travel',
      'Flexible work schedule',
      'Equity participation'
    ],
    applicationCost: 50,
    postedDate: '2024-01-08T00:00:00Z',
    isPartnership: true,
    companySize: '500+',
    industry: 'Artificial Intelligence',
    tags: ['AI', 'Research', 'Machine Learning']
  },
  {
    id: 'job-5',
    title: 'Business Analyst',
    company: 'ConsultPro',
    companyLogo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    location: 'Chicago, IL',
    locationType: 'hybrid',
    salaryMin: 70000,
    salaryMax: 95000,
    currency: 'USD',
    requiredSkills: ['Excel Mastery', 'Data Analysis'],
    preferredSkills: ['Project Management', 'SQL'],
    experienceLevel: 'mid',
    description: 'Analyze business processes and recommend solutions to improve efficiency and profitability.',
    responsibilities: [
      'Analyze business requirements and processes',
      'Create detailed reports and presentations',
      'Facilitate stakeholder meetings',
      'Recommend process improvements'
    ],
    requirements: [
      'Bachelor\'s degree in Business or related field',
      'Strong analytical and problem-solving skills',
      'Advanced Excel and data analysis skills',
      'Excellent communication and presentation skills'
    ],
    benefits: [
      'Competitive salary and bonuses',
      'Comprehensive health benefits',
      'Professional development opportunities',
      'Flexible work arrangements'
    ],
    applicationCost: 25,
    postedDate: '2024-01-14T00:00:00Z',
    isPartnership: false,
    companySize: '100-500',
    industry: 'Consulting',
    tags: ['Business Analysis', 'Excel', 'Consulting']
  }
];

export const successStories: SuccessStory[] = [
  {
    id: 'story-1',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    jobTitle: 'Python Developer',
    company: 'TechCorp',
    skillsUsed: ['Python Programming', 'Data Analysis'],
    story: 'After completing the Python Programming track on SkillCoin, I felt confident applying to TechCorp. The hands-on projects and certificates really helped me stand out during the interview process.',
    timeToHire: 21,
    salaryIncrease: 35,
    date: '2024-01-05T00:00:00Z'
  },
  {
    id: 'story-2',
    userName: 'Marcus Johnson',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    jobTitle: 'Data Analyst',
    company: 'DataInsights Inc',
    skillsUsed: ['Excel Mastery', 'Data Analysis'],
    story: 'The Excel Mastery course was a game-changer for my career. I went from basic spreadsheet user to creating complex pivot tables and dashboards. Got hired within 2 weeks of completing the course!',
    timeToHire: 14,
    salaryIncrease: 28,
    date: '2023-12-20T00:00:00Z'
  },
  {
    id: 'story-3',
    userName: 'Emily Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    jobTitle: 'Digital Marketing Specialist',
    company: 'GrowthLab',
    skillsUsed: ['Digital Marketing', 'SEO'],
    story: 'SkillCoin\'s Digital Marketing track taught me everything from SEO basics to advanced campaign management. The practical projects gave me a portfolio that impressed employers.',
    timeToHire: 18,
    salaryIncrease: 42,
    date: '2023-12-15T00:00:00Z'
  }
];

export const interviewQuestions: Record<string, InterviewQuestion[]> = {
  'Python Programming': [
    {
      id: 'py-1',
      question: 'Explain the difference between lists and tuples in Python.',
      category: 'Technical',
      difficulty: 'easy',
      sampleAnswer: 'Lists are mutable and use square brackets, while tuples are immutable and use parentheses.',
      tips: ['Give concrete examples', 'Mention use cases for each', 'Discuss performance implications']
    },
    {
      id: 'py-2',
      question: 'How would you handle exceptions in Python?',
      category: 'Technical',
      difficulty: 'medium',
      tips: ['Explain try-except blocks', 'Mention specific exception types', 'Discuss best practices']
    }
  ],
  'Data Analysis': [
    {
      id: 'da-1',
      question: 'How do you handle missing data in a dataset?',
      category: 'Technical',
      difficulty: 'medium',
      tips: ['Discuss different strategies', 'Mention when to use each approach', 'Consider data quality impact']
    }
  ],
  'Digital Marketing': [
    {
      id: 'dm-1',
      question: 'How do you measure the success of a digital marketing campaign?',
      category: 'Strategic',
      difficulty: 'medium',
      tips: ['Mention key metrics (ROI, CTR, conversion rate)', 'Discuss attribution models', 'Talk about A/B testing']
    }
  ]
};

export const companyInfo: Record<string, CompanyInfo> = {
  'TechCorp': {
    name: 'TechCorp',
    description: 'Leading technology company focused on innovative software solutions.',
    culture: ['Innovation-driven', 'Collaborative', 'Work-life balance', 'Continuous learning'],
    recentNews: [
      'Launched new AI-powered platform',
      'Expanded to European markets',
      'Received Best Workplace award'
    ],
    interviewProcess: [
      'Initial phone screening (30 min)',
      'Technical assessment (1 hour)',
      'Team interview (45 min)',
      'Final interview with hiring manager (30 min)'
    ]
  },
  'DataInsights Inc': {
    name: 'DataInsights Inc',
    description: 'Data analytics company helping businesses make data-driven decisions.',
    culture: ['Data-driven', 'Remote-first', 'Results-oriented', 'Inclusive'],
    recentNews: [
      'Secured Series B funding',
      'Partnership with major retail chain',
      'Launched new analytics dashboard'
    ],
    interviewProcess: [
      'Application review',
      'Video interview with HR (30 min)',
      'Technical case study presentation (1 hour)',
      'Meet the team session (45 min)'
    ]
  }
};

export const getJobById = (id: string): Job | null => {
  return mockJobs.find(job => job.id === id) || null;
};

export const getJobsBySkills = (userSkills: string[]): Job[] => {
  return mockJobs.filter(job => 
    job.requiredSkills.some(skill => userSkills.includes(skill)) ||
    job.preferredSkills?.some(skill => userSkills.includes(skill))
  );
};

export const calculateSkillMatch = (job: Job, userSkills: string[]): number => {
  const requiredMatches = job.requiredSkills.filter(skill => userSkills.includes(skill)).length;
  const preferredMatches = job.preferredSkills?.filter(skill => userSkills.includes(skill)).length || 0;
  
  const requiredWeight = 0.7;
  const preferredWeight = 0.3;
  
  const requiredScore = (requiredMatches / job.requiredSkills.length) * requiredWeight;
  const preferredScore = job.preferredSkills 
    ? (preferredMatches / job.preferredSkills.length) * preferredWeight 
    : 0;
  
  return Math.round((requiredScore + preferredScore) * 100);
};