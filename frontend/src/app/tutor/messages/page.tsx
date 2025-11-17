'use client'

import { useState } from 'react';
import { ChatLayout } from './components/chat-layout';
import { tutorConversations, tutorMessages } from './data';

export default function TutorMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(tutorConversations[0]);

  return (
    <div className='h-full flex flex-col'>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Messages</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Chat with your students and other tutors.
        </p>
      </header>
      <main className='flex-grow'>
         <ChatLayout 
            conversations={tutorConversations}
            messages={tutorMessages[selectedConversation.id]}
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
            currentUserId="T002"
        />
      </main>
    </div>
  );
}
