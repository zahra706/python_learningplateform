package com.example.springboot.service;

import com.example.springboot.model.Favorite;
import com.example.springboot.repository.FavoriteRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class FavoriteServiceTest {
    @Mock
    private FavoriteRepository favoriteRepository;
    @InjectMocks
    private FavoriteService favoriteService;

    @Test
    public void testAddFavorite() {
        Favorite favorite = new Favorite();
        favorite.setId("1");
        when(favoriteRepository.save(favorite)).thenReturn(favorite);
        Favorite result = favoriteService.addFavorite(favorite);
        assertEquals("1", result.getId());
    }
}