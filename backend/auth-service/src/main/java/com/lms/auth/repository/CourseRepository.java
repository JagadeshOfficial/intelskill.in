package com.lms.auth.repository;

import com.lms.auth.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
	@org.springframework.data.jpa.repository.Query("SELECT c FROM Tutor t JOIN t.courses c WHERE t.id = :tutorId")
	java.util.List<Course> findCoursesByTutorId(
			@org.springframework.web.bind.annotation.PathVariable("tutorId") Integer tutorId);
}
