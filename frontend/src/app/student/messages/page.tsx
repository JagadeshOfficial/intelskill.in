'use client'

import { ChatLayout } from '@/app/tutor/messages/components/chat-layout';
import { studentConversations, studentMessages } from '@/app/tutor/messages/data';
import { useState } from 'react';

export default function StudentMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(studentConversations[0]);

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Messages</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Chat with your tutors and classmates.
        </p>
      </header>
      <main className="flex-grow">
        <ChatLayout 
          conversations={studentConversations}
          messages={studentMessages[selectedConversation.id]}
          selectedConversation={selectedConversation}
          onConversationSelect={setSelectedConversation}
          currentUserId="S001"
        />
      </main>
    </div>
  );
}
