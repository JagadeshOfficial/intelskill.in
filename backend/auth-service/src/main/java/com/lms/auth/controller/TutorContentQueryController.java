package com.lms.auth.controller;

import com.lms.auth.entity.TutorContent;
import com.lms.auth.repository.TutorContentRepository;
import com.lms.auth.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tutor/content")
public class TutorContentQueryController {
    @Autowired
    private TutorContentRepository tutorContentRepository;
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public List<TutorContent> getTutorContent(@RequestHeader("Authorization") String authorization) {
        Integer tutorId = jwtTokenProvider.getAdminIdFromToken(authorization.substring(7));
        return tutorContentRepository.findByTutorId(tutorId);
    }
}
