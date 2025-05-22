package com.example.springboot.controller;

import com.example.springboot.model.Favorite;
import com.example.springboot.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites") // Gardez cette URL pour correspondre à votre frontend
@CrossOrigin(origins = "http://localhost:3000")
public class FavoriteController {
    @Autowired
    private FavoriteService favoriteService;

    @PostMapping
    public Favorite addFavorite(@RequestBody Favorite favorite) {
        return favoriteService.addFavorite(favorite);
    }

    @DeleteMapping
    public void removeFavorite(@RequestParam String studentId,
                               @RequestParam Integer bookId) {
        favoriteService.removeFavorite(studentId, bookId);
    }

    @GetMapping
    public List<Favorite> getFavoritesByUser(@RequestParam String studentId) {
        return favoriteService.getFavoritesByUser(studentId);
    }
}