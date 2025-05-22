package com.example.springboot.repository;

import com.example.springboot.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByStudentId(String studentId); // Changé de student_id à studentId

    void deleteByStudentIdAndBookId(String studentId, Integer bookId); // Changé ici aussi

    boolean existsByStudentIdAndBookId(String studentId, Integer bookId); // Et ici

    // Gardez cette méthode si vous en avez besoin
    @Query("{'student_id': ?0, 'book_id': ?1}")
    boolean existsByStudent_idAndBook_id(String studentId, Integer bookId);
}