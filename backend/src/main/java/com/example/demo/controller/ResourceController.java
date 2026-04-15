package com.example.demo.controller;

import com.example.demo.dto.request.ResourceRequestDTO;
import com.example.demo.dto.response.ResourceResponseDTO;
import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import com.example.demo.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class ResourceController {

    private final ResourceService resourceService;

    // 1. GET all resources (with optional filters)
    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) ResourceStatus status) {

        if (type != null || location != null || minCapacity != null || status != null) {
            return ResponseEntity.ok(
                resourceService.searchResources(type, location, minCapacity, status)
            );
        }
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // 2. GET single resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // 3. POST create new resource (ADMIN only)
    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto));
    }

    // 4. PUT update resource (ADMIN only)
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // 5. DELETE resource (ADMIN only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}