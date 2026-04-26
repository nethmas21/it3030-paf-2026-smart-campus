package com.example.demo.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    @GetMapping("/{ticketId}/{fileName}")
    public ResponseEntity<Resource> getFile(
            @PathVariable Long ticketId,
            @PathVariable String fileName) {

        try {
            Path filePath = Paths.get(uploadDir, ticketId.toString(), fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);

        } catch (Exception e) {
            throw new RuntimeException("Cannot load file");
        }
    }
}
