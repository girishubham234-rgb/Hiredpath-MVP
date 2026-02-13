
import React from 'react';

export const TRUST_LOGOS = [
  "https://picsum.photos/id/1/120/40",
  "https://picsum.photos/id/2/120/40",
  "https://picsum.photos/id/3/120/40",
  "https://picsum.photos/id/4/120/40",
  "https://picsum.photos/id/5/120/40",
];

export const SKILLS_LIST = [
  'React.js', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Data Science', 'UI/UX Design', 'Cloud Computing', 'AWS', 'Machine Learning'
];

export const ROLE_MARKETPLACE = [
  {
    id: '1',
    title: 'Frontend Engineer (React)',
    companies: ['Google', 'Meta', 'Netflix'],
    salaryRange: '₹12 - ₹18 LPA',
    duration: '12 Weeks',
    hasAssurance: true,
    requiredSkills: ['React.js', 'TypeScript', 'CSS/Tailwind'],
    roadmap: [
      { week: 1, topic: 'Advanced State Management', status: 'completed' },
      { week: 2, topic: 'React Patterns & Architecture', status: 'current' },
      { week: 3, topic: 'Testing & Performance', status: 'upcoming' },
      { week: 4, topic: 'Backend Integration', status: 'upcoming' }
    ],
    guarantees: ['10+ Guaranteed Interviews', 'Full Fee Refund if not placed', 'Direct Mentor Support']
  },
  {
    id: '2',
    title: 'Data Analyst',
    companies: ['Deloitte', 'PwC', 'KPMG'],
    salaryRange: '₹8 - ₹14 LPA',
    duration: '8 Weeks',
    hasAssurance: true,
    requiredSkills: ['SQL', 'Python', 'PowerBI'],
    roadmap: [
      { week: 1, topic: 'SQL Optimization', status: 'upcoming' },
      { week: 2, topic: 'Statistical Modeling', status: 'upcoming' }
    ],
    guarantees: ['Placement in Big 4', 'Industry Certification', 'Capstone Project']
  }
];

export const COLLEGE_PLANS = [
  { id: 'starter', name: 'Starter', capacity: '100 Students', price: '₹49,000/yr', features: ['Core Dashboard', 'CSV Upload', 'Basic Reports'] },
  { id: 'pro', name: 'Growth', capacity: '500 Students', price: '₹1,99,000/yr', features: ['AI Readiness Scoring', 'Direct Employer Pipeline', 'Priority Placement'] },
  { id: 'enterprise', name: 'Elite', capacity: 'Unlimited', price: 'Contact Sales', features: ['Custom Training Paths', 'White-labeled Dashboard', 'Dedicated Success Manager'] }
];
