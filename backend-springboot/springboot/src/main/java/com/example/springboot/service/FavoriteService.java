package com.example.springboot.service;

import com.example.springboot.model.Favorite;
import com.example.springboot.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FavoriteService {
    @Autowired
    private FavoriteRepository favoriteRepository;

    public Favorite addFavorite(Favorite favorite) {
        if (favoriteRepository.existsByStudentIdAndBookId(
                favorite.getStudentId(),
                favorite.getBookId())) {
            return favorite;
        }
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(String studentId, Integer bookId) {
        favoriteRepository.deleteByStudentIdAndBookId(studentId, bookId);
    }

    public List<Favorite> getFavoritesByUser(String studentId) {
        return favoriteRepository.findByStudentId(studentId);
    }
}