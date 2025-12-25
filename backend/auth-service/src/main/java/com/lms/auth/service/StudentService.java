package com.lms.auth.service;

import com.lms.auth.entity.Student;
import com.lms.auth.repository.StudentRepository;
import com.lms.auth.dto.StudentRegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public Student registerStudent(StudentRegisterRequest request) throws Exception {
        // basic validation
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        Student student = new Student();
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setVerified(true); // OTP verified before calling register
        student.setStatus("APPROVED");
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());

        Student saved = studentRepository.save(student);
        return saved;
    }

    public Optional<Student> findByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public Student updateLastLogin(Integer studentId) {
        Optional<Student> opt = studentRepository.findById(studentId);
        if (opt.isPresent()) {
            Student s = opt.get();
            s.setLastLogin(LocalDateTime.now());
            s.setUpdatedAt(LocalDateTime.now());
            return studentRepository.save(s);
        }
        return null;
    }

    public String generateToken(Student student) {
        return jwtTokenProvider.generateAdminToken(student.getId(), student.getEmail(), "STUDENT");
    }

    public java.util.Optional<Student> getStudentById(Integer id) {
        return studentRepository.findById(id);
    }

    public java.util.Optional<Student> updateStudentProfile(Integer studentId, java.util.Map<String, String> updates) {
        Optional<Student> opt = studentRepository.findById(studentId);
        if (opt.isPresent()) {
            Student s = opt.get();
            if (updates.containsKey("firstName"))
                s.setFirstName(updates.get("firstName"));
            if (updates.containsKey("lastName"))
                s.setLastName(updates.get("lastName"));
            if (updates.containsKey("phoneNumber"))
                s.setPhoneNumber(updates.get("phoneNumber"));
            if (updates.containsKey("photoUrl"))
                s.setPhotoUrl(updates.get("photoUrl"));
            s.setUpdatedAt(LocalDateTime.now());
            Student saved = studentRepository.save(s);
            return java.util.Optional.of(saved);
        }
        return java.util.Optional.empty();
    }

    public Student updateStudentPhotoUrl(Integer studentId, String photoUrl) {
        Optional<Student> opt = studentRepository.findById(studentId);
        if (opt.isPresent()) {
            Student s = opt.get();
            s.setPhotoUrl(photoUrl);
            s.setUpdatedAt(LocalDateTime.now());
            return studentRepository.save(s);
        }
        throw new IllegalArgumentException("Student not found with id: " + studentId);
    }

    // Return all students (for admin listing)
    public java.util.List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Create a student as admin (used by admin UI)
    public Student createStudentAsAdmin(java.util.Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        String firstName = (String) body.get("firstName");
        String lastName = (String) body.get("lastName");
        String phone = (String) body.get("phoneNumber");
        String status = (String) body.getOrDefault("status", "APPROVED");

        if (email == null || email.isEmpty())
            throw new IllegalArgumentException("Email is required");
        if (firstName == null || firstName.isEmpty())
            throw new IllegalArgumentException("First name is required");
        if (lastName == null || lastName.isEmpty())
            throw new IllegalArgumentException("Last name is required");

        if (studentRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        Student s = new Student();
        s.setEmail(email);
        if (password == null || password.isEmpty()) {
            // generate a temporary password
            password = java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        s.setPassword(passwordEncoder.encode(password));
        s.setFirstName(firstName);
        s.setLastName(lastName);
        s.setPhoneNumber(phone);
        s.setVerified(true);
        s.setStatus(status != null ? status : "APPROVED");
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());

        return studentRepository.save(s);
    }

    // Update student status
    public Student updateStudentStatus(Integer id, String status) {
        var opt = studentRepository.findById(id);
        if (opt.isEmpty())
            throw new IllegalArgumentException("Student not found");
        Student s = opt.get();
        s.setStatus(status);
        s.setUpdatedAt(LocalDateTime.now());
        return studentRepository.save(s);
    }

    // Delete student
    public void deleteStudent(Integer id) {
        if (!studentRepository.existsById(id))
            throw new IllegalArgumentException("Student not found");
        studentRepository.deleteById(id);
    }

    public void changePassword(Integer studentId, String currentPassword, String newPassword) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
                throw new IllegalArgumentException("Incorrect current password");
            }
            student.setPassword(passwordEncoder.encode(newPassword));
            studentRepository.save(student);
        } else {
            throw new IllegalArgumentException("Student not found");
        }
    }

}
