import {
    Code,
    Globe,
    Briefcase,
    Cpu,
    Terminal,
    Database
} from 'lucide-react';

export const categories = [
    {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        // icon: <Code className="h-6 w-6" />, // Icons can't be easily exported as data if they are React Elements in shared ts file without 'use client'? 
        // Actually they can, but let's stick to string ids or just import icons in components.
        iconName: 'Code',
        description: 'Master the fundamental building blocks of programming.',
        color: 'bg-blue-50 text-blue-600',
        topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching']
    },
    {
        id: 'web',
        title: 'Web Development',
        iconName: 'Globe',
        description: 'Full stack development guides from frontend to backend.',
        color: 'bg-green-50 text-green-600',
        topics: ['HTML & CSS', 'JavaScript', 'React', 'Node.js', 'Next.js', 'System Design', 'APIs']
    },
    {
        id: 'interview',
        title: 'Interview Preparation',
        iconName: 'Briefcase',
        description: 'Curated questions and guides for top tech companies.',
        color: 'bg-purple-50 text-purple-600',
        topics: ['Top 100 Questions', 'Company Wise Prep', 'Mock Tests', 'Resumes', 'Behavioral Round', 'System Design']
    },
    {
        id: 'cs',
        title: 'CS Subjects',
        iconName: 'Cpu',
        description: 'Core computer science concepts for interviews and exams.',
        color: 'bg-orange-50 text-orange-600',
        topics: ['Operating Systems', 'DBMS', 'Computer Networks', 'OOPs', 'Compiler Design', 'Digital Logic']
    },
    {
        id: 'languages',
        title: 'Programming Languages',
        iconName: 'Terminal',
        description: 'In-depth tutorials for popular programming languages.',
        color: 'bg-pink-50 text-pink-600',
        topics: ['C++', 'Java', 'Python', 'C#', 'Go', 'Rust', 'TypeScript']
    },
    {
        id: 'database',
        title: 'Databases',
        iconName: 'Database',
        description: 'Learn SQL and NoSQL database management systems.',
        color: 'bg-indigo-50 text-indigo-600',
        topics: ['SQL Basics', 'MongoDB', 'PostgreSQL', 'Redis', 'Normalization', 'Indexing']
    }
];

export const topicContent = {
    'dsa': {
        title: 'Data Structures and Algorithms',
        intro: 'DSA is the foundation of efficient coding. Learn about time complexity, data organization, and algorithmic strategies.',
        sections: [
            {
                title: 'Arrays',
                content: 'An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.'
            },
            {
                title: 'Linked Lists',
                content: 'A linked list is a linear data structure, in which the elements are not stored at contiguous memory locations.'
            }
        ]
    },
    // Add other category mocks as needed
};
