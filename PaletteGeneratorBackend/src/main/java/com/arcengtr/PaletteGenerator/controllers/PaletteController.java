package com.arcengtr.PaletteGenerator.controllers;

import com.arcengtr.PaletteGenerator.dtos.palette.*;
import com.arcengtr.PaletteGenerator.entities.Palette;
import com.arcengtr.PaletteGenerator.services.PaletteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/palette")
@RequiredArgsConstructor
public class PaletteController {

    private final PaletteService paletteService;

    @PostMapping("/generate/kmeans")
    public ResponseEntity<?> processImageKMeans(@RequestBody final ImageKMeansPaletteRequestDTO request) {
        if (request == null || request.getBase64Image() == null || request.getBase64Image().isEmpty()) {
            return ResponseEntity.badRequest().body("Request body or base64Image field cannot be empty.");
        }

        try {
            List<List<Integer>> palette = paletteService.generateKMeansPalette(request);
            return ResponseEntity.ok().body(GeneratedKMeansPaletteResponseDTO.builder().palette(palette).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Base64 string: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error processing image or during palette generation: " + e.getMessage());
        } catch (Exception e) {
            // Логировать e.getMessage() для отладки
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/generate/som")
    public ResponseEntity<?> processImageSom(@RequestBody final ImageSOMPaletteRequestDTO request) {
        if (request == null || request.getBase64Image() == null || request.getBase64Image().isEmpty()) {
            return ResponseEntity.badRequest().body("Request body or base64Image field cannot be empty.");
        }

        try {
            List<List<List<Integer>>> palette = paletteService.generateSOMPalette(request);
            return ResponseEntity.ok().body(GeneratedHierarchicalPaletteResponseDTO.builder().palette(palette).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Base64 string: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error processing image or during palette generation: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/generate/history")
    public ResponseEntity<?> processImageHistoryHierarch(@RequestBody final ImageHierarchicalPaletteRequestDTO request) {
        if (request == null || request.getBase64Image() == null || request.getBase64Image().isEmpty()) {
            return ResponseEntity.badRequest().body("Request body or base64Image field cannot be empty.");
        }

        try {
            List<List<List<Integer>>> palette = paletteService.generateHierarchicalPaletteWithHistory(request);
            return ResponseEntity.ok().body(GeneratedHierarchicalPaletteResponseDTO.builder().palette(palette).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Base64 string: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error processing image or during palette generation: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/save/{paletteId}")
    public ResponseEntity<?> savePalette(@PathVariable UUID paletteId) {

        System.out.println("Saved: " + paletteId);

        paletteService.savePalette(paletteId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/publish/{paletteId}")
    public ResponseEntity<?> publishPalette(@PathVariable UUID paletteId) {

        System.out.println("Published: " + paletteId);

        paletteService.publishPalette(paletteId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/save/history")
    public Palette savePaletteToHistory(@RequestBody final PaletteDTO paletteDTO) {

        System.out.println("Saving palette to history");

        return paletteService.savePaletteToHistory(paletteDTO);
    }

    @GetMapping("/history")
    public List<PaletteDTO> loadUserHistory() {
        System.out.println("Loading history");
        return paletteService.loadUserPaletteHistory();
    }

    @DeleteMapping("/delete/history")
    public ResponseEntity<?> deletePaletteHistory() {

        paletteService.deleteUserPaletteHistory();

        return ResponseEntity.ok().build();
    }

    @GetMapping("/publishedPage")
    public Page<PaletteDTO> publishedPalettes(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "21") Integer size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        return paletteService.loadPublishedPalettesPageable(pageable);
    }

    @GetMapping("/published")
    public List<PaletteDTO> publishedPalettes() {
        return paletteService.loadPublishedPalettes();
    }

    @PostMapping("/vote/{paletteId}")
    public PaletteDTO votePalette(@PathVariable UUID paletteId) {
        return paletteService.upvotePalette(paletteId);
    }

    @DeleteMapping("vote/{paletteId}")
    public PaletteDTO removeVote(@PathVariable UUID paletteId) {
        System.out.println("Unvoting");
        return paletteService.removeVote(paletteId);
    }

    @GetMapping("get/{paletteId}")
    public PaletteDTO getPalette(@PathVariable UUID paletteId) {
        return paletteService.getPaletteById(paletteId);
    }

    @GetMapping("voted")
    public List<PaletteDTO> votedPalettes() {
        return paletteService.getUserVotedPalettes(); //Better to handle userId fetch outside of method, so it'll be responsible for jest one action
    }

    @GetMapping("saved")
    public List<PaletteDTO> savedPalettes() {
        return paletteService.getUserSavedPalettes();
    }

    @DeleteMapping("palettes/{paletteId}")
    public ResponseEntity<?> deletePalette(@PathVariable UUID paletteId) {
        if (paletteService.deletePalette(paletteId) > 0) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}