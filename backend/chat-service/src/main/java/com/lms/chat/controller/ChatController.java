package com.lms.chat.controller;

import com.lms.chat.model.ChatMessage;
import com.lms.chat.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin(origins = "*") // Allow frontend
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatRepository chatRepository;

    /**
     * Handle incoming messages via WebSocket
     * Endpoint: /app/chat
     */
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        // 1. Save to DB
        ChatMessage saved = chatRepository.save(chatMessage);
        
        // 2. Send to Recipient's Topic
        // Frontend subscribes to: /topic/messages/{myUserId}
        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getRecipientId(),
                saved
        );
        
        // 3. Send back to Sender (for sync across their devices)
         messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getSenderId(),
                saved
        );
    }

    /**
     * REST Endpoint to get chat history
     */
    @GetMapping("/api/messages/{user1}/{user2}")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@PathVariable String user1, @PathVariable String user2) {
        return chatRepository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            user1, user2, user2, user1
        );
    }
}
