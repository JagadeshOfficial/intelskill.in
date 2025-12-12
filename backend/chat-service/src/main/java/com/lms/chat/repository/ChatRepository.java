package com.lms.chat.repository;

import com.lms.chat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    
    // Find chat between two users (naive implementation)
    // Sender A, Recipient B OR Sender B, Recipient A
    // JPQL usually
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            String senderId1, String recipientId1,
            String senderId2, String recipientId2
    );
}
