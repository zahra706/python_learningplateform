package com.example.springboot.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "favorites")
public class Favorite {
    @Id
    private String id;

    @Field("student_id") // Ceci mappe le champ MongoDB
    private String studentId; // Renommé de student_id à studentId

    @Field("book_id") // Ceci mappe le champ MongoDB
    private Integer bookId; // Renommé de book_id à bookId

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }
}