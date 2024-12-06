import {
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths
} from 'date-fns';

const today = new Date();

export const exampleStatuses = [
  { id: '1', status: 'Planned', color: '#FFD700' },
  { id: '2', status: 'In Progress', color: '#1E90FF' },
  { id: '3', status: 'Done', color: '#32CD32' }
];

export const exampleFeatures = [
  {
    id: '1',
    name: 'AI Scene Analysis',
    startAt: startOfMonth(subMonths(today, 6)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '1',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1',
        name: 'Alice Johnson'
      }
    ],
    release: { id: '1', name: 'v1.0' }
  },
  {
    id: '2',
    name: 'Collaborative Editing',
    startAt: startOfMonth(subMonths(today, 5)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '2',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2',
        name: 'Bob Smith'
      }
    ],
    release: { id: '1', name: 'v1.0' }
  },
  {
    id: '3',
    name: 'AI-Powered Color Grading',
    startAt: startOfMonth(subMonths(today, 4)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '3',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3',
        name: 'Charlie Brown'
      }
    ],
    release: { id: '2', name: 'v1.1' }
  },
  {
    id: '4',
    name: 'Real-time Video Chat',
    startAt: startOfMonth(subMonths(today, 3)),
    endAt: subDays(endOfMonth(today), 12),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '4',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4',
        name: 'Diana Prince'
      }
    ],
    release: { id: '2', name: 'v1.1' }
  },
  {
    id: '5',
    name: 'AI Voice-to-Text Subtitles',
    startAt: startOfMonth(subMonths(today, 2)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '5',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5',
        name: 'Ethan Hunt'
      }
    ],
    release: { id: '2', name: 'v1.1' }
  },
  {
    id: '6',
    name: 'Cloud Asset Management',
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: endOfMonth(today),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '6',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=6',
        name: 'Fiona Gallagher'
      }
    ],
    release: { id: '3', name: 'v1.2' }
  },
  {
    id: '7',
    name: 'AI-Assisted Video Transitions',
    startAt: startOfMonth(today),
    endAt: endOfMonth(addMonths(today, 1)),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '7',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=7',
        name: 'George Lucas'
      }
    ],
    release: { id: '3', name: 'v1.2' }
  },
  {
    id: '8',
    name: 'Version Control System',
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: endOfMonth(addMonths(today, 2)),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '8',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=8',
        name: 'Hannah Montana'
      }
    ],
    release: { id: '3', name: 'v1.2' }
  },
  {
    id: '9',
    name: 'AI Content-Aware Fill',
    startAt: startOfMonth(addMonths(today, 2)),
    endAt: endOfMonth(addMonths(today, 3)),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '9',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=9',
        name: 'Ian Malcolm'
      }
    ],
    release: { id: '4', name: 'v1.3' }
  },
  {
    id: '10',
    name: 'Multi-User Permissions',
    startAt: startOfMonth(addMonths(today, 3)),
    endAt: endOfMonth(addMonths(today, 4)),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '10',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=10',
        name: 'Julia Roberts'
      }
    ],
    release: { id: '4', name: 'v1.3' }
  },
  {
    id: '11',
    name: 'AI-Powered Audio Enhancement',
    startAt: startOfMonth(addMonths(today, 4)),
    endAt: endOfMonth(addMonths(today, 5)),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '11',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=11',
        name: 'Kevin Hart'
      }
    ],
    release: { id: '4', name: 'v1.3' }
  },
  {
    id: '12',
    name: 'Real-time Project Analytics',
    startAt: startOfMonth(addMonths(today, 5)),
    endAt: endOfMonth(addMonths(today, 6)),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '12',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=12',
        name: 'Lara Croft'
      }
    ],
    release: { id: '5', name: 'v1.4' }
  },
  {
    id: '13',
    name: 'AI Scene Recommendations',
    startAt: startOfMonth(addMonths(today, 6)),
    endAt: endOfMonth(addMonths(today, 7)),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '13',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=13',
        name: 'Michael Scott'
      }
    ],
    release: { id: '5', name: 'v1.4' }
  },
  {
    id: '14',
    name: 'Collaborative Storyboarding',
    startAt: startOfMonth(addMonths(today, 7)),
    endAt: endOfMonth(addMonths(today, 8)),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '14',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=14',
        name: 'Natalie Portman'
      }
    ],
    release: { id: '5', name: 'v1.4' }
  },
  {
    id: '15',
    name: 'AI-Driven Video Compression',
    startAt: startOfMonth(addMonths(today, 8)),
    endAt: endOfMonth(addMonths(today, 9)),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '15',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=15',
        name: 'Oscar Isaac'
      }
    ],
    release: { id: '6', name: 'v1.5' }
  },
  {
    id: '16',
    name: 'Global CDN Integration',
    startAt: startOfMonth(addMonths(today, 9)),
    endAt: endOfMonth(addMonths(today, 10)),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '16',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=16',
        name: 'Penelope Cruz'
      }
    ],
    release: { id: '6', name: 'v1.5' }
  },
  {
    id: '17',
    name: 'AI Object Tracking',
    startAt: startOfMonth(addMonths(today, 10)),
    endAt: endOfMonth(addMonths(today, 11)),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '17',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=17',
        name: 'Quentin Tarantino'
      }
    ],
    release: { id: '6', name: 'v1.5' }
  },
  {
    id: '18',
    name: 'Real-time Language Translation',
    startAt: startOfMonth(addMonths(today, 11)),
    endAt: endOfMonth(addMonths(today, 12)),
    status: exampleStatuses[2],
    assignees: [
      {
        id: '18',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=18',
        name: 'Rachel Green'
      }
    ],
    release: { id: '7', name: 'v1.6' }
  },
  {
    id: '19',
    name: 'AI-Powered Video Summarization',
    startAt: startOfMonth(addMonths(today, 12)),
    endAt: endOfMonth(addMonths(today, 13)),
    status: exampleStatuses[0],
    assignees: [
      {
        id: '19',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=19',
        name: 'Samuel L. Jackson'
      }
    ],
    release: { id: '7', name: 'v1.6' }
  },
  {
    id: '20',
    name: 'Blockchain-based Asset Licensing',
    startAt: startOfMonth(addMonths(today, 13)),
    endAt: endOfMonth(addMonths(today, 14)),
    status: exampleStatuses[1],
    assignees: [
      {
        id: '20',
        image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=20',
        name: 'Tom Hanks'
      }
    ],
    release: { id: '7', name: 'v1.6' }
  }
];

export const exampleMarkers = [
  {
    id: '1',
    date: startOfMonth(subMonths(today, 3)),
    label: 'Project Kickoff',
    className: 'bg-blue-100 text-blue-900'
  },
  {
    id: '2',
    date: subMonths(endOfMonth(today), 2),
    label: 'Phase 1 Completion',
    className: 'bg-green-100 text-green-900'
  },
  {
    id: '3',
    date: startOfMonth(addMonths(today, 3)),
    label: 'Beta Release',
    className: 'bg-purple-100 text-purple-900'
  },
  {
    id: '4',
    date: endOfMonth(addMonths(today, 6)),
    label: 'Version 1.0 Launch',
    className: 'bg-red-100 text-red-900'
  },
  {
    id: '5',
    date: startOfMonth(addMonths(today, 9)),
    label: 'User Feedback Review',
    className: 'bg-orange-100 text-orange-900'
  },
  {
    id: '6',
    date: endOfMonth(addMonths(today, 12)),
    label: 'Annual Performance Evaluation',
    className: 'bg-teal-100 text-teal-900'
  }
];
