export interface Conversation {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    status: 'online' | 'offline';
}

export interface Message {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
}

// Mock data for Tutors
export const tutorConversations: Conversation[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        lastMessage: 'Thank you for the feedback!',
        lastMessageTime: '5m',
        status: 'online'
    },
    {
        id: '2',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267072',
        lastMessage: 'Can we schedule a call?',
        lastMessageTime: '1h',
        status: 'offline'
    },
     {
        id: '3',
        name: 'MERN Stack - Batch 1',
        avatar: 'https://i.pravatar.cc/150?u=g01',
        lastMessage: 'Sam: Remember the project deadline!',
        lastMessageTime: '3h',
        status: 'online'
    },
];

export const tutorMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1-1', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'Hi Dr. Tanaka, I had a question about the last assignment.' },
        { id: 'm1-2', authorId: 'T002', authorName: 'Kenji Tanaka', authorAvatar: 'https://i.pravatar.cc/150?u=t02', content: 'Of course, Alex. What can I help you with?' },
        { id: 'm1-3', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'I\'m having trouble with the database connection part.' },
        { id: 'm1-4', authorId: 'T002', authorName: 'Kenji Tanaka', authorAvatar: 'https://i.pravatar.cc/150?u=t02', content: 'Make sure you have the environment variables set up correctly. I\'ve sent you the documentation link.' },
        { id: 'm1-5', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'Thank you for the feedback!' },
    ],
    '2': [
        { id: 'm2-1', authorId: 'S002', authorName: 'Maria Garcia', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e290267072', content: 'Can we schedule a call?' },
    ],
     '3': [
        { id: 'm3-1', authorId: 'S003', authorName: 'Sam Chen', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707e', content: 'Remember the project deadline!' },
    ]
};


// Mock data for Students
export const studentConversations: Conversation[] = [
    {
        id: '1',
        name: 'Dr. Kenji Tanaka',
        avatar: 'https://i.pravatar.cc/150?u=t02',
        lastMessage: 'You: Thank you for the feedback!',
        lastMessageTime: '5m',
        status: 'online'
    },
    {
        id: '2',
        name: 'MERN Stack - Batch 1',
        avatar: 'https://i.pravatar.cc/150?u=g01',
        lastMessage: 'Sam: Remember the project deadline!',
        lastMessageTime: '3h',
        status: 'online'
    },
     {
        id: '3',
        name: 'Dr. Evelyn Reed',
        avatar: 'https://i.pravatar.cc/150?u=t01',
        lastMessage: 'You\'re welcome! Keep up the good work.',
        lastMessageTime: '1d',
        status: 'offline'
    },
];

export const studentMessages: Record<string, Message[]> = {
    '1': [
        { id: 'm1-1', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'Hi Dr. Tanaka, I had a question about the last assignment.' },
        { id: 'm1-2', authorId: 'T002', authorName: 'Kenji Tanaka', authorAvatar: 'https://i.pravatar.cc/150?u=t02', content: 'Of course, Alex. What can I help you with?' },
        { id: 'm1-3', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'I\'m having trouble with the database connection part.' },
        { id: 'm1-4', authorId: 'T002', authorName: 'Kenji Tanaka', authorAvatar: 'https://i.pravatar.cc/150?u=t02', content: 'Make sure you have the environment variables set up correctly. I\'ve sent you the documentation link.' },
        { id: 'm1-5', authorId: 'S001', authorName: 'Alex Johnson', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', content: 'Thank you for the feedback!' },
    ],
    '2': [
        { id: 'm2-1', authorId: 'S003', authorName: 'Sam Chen', authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707e', content: 'Remember the project deadline!' },
    ],
     '3': [
        { id: 'm3-1', authorId: 'T001', authorName: 'Dr. Evelyn Reed', authorAvatar: 'https://i.pravatar.cc/150?u=t01', content: 'You\'re welcome! Keep up the good work.' },
    ]
};
