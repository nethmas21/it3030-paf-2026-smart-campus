package com.example.demo.service;

import com.example.demo.dto.request.ResourceRequestDTO;
import com.example.demo.dto.response.ResourceResponseDTO;
import com.example.demo.entity.Resource;
import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // CREATE
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .availabilityWindows(dto.getAvailabilityWindows())
                .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
                .description(dto.getDescription())
                .build();
        return mapToDTO(resourceRepository.save(resource));
    }

    // GET ALL
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // GET BY ID
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToDTO(resource);
    }

    // UPDATE
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setAvailabilityWindows(dto.getAvailabilityWindows());
        resource.setStatus(dto.getStatus());
        resource.setDescription(dto.getDescription());

        return mapToDTO(resourceRepository.save(resource));
    }

    // DELETE
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // SEARCH / FILTER
    public List<ResourceResponseDTO> searchResources(
            ResourceType type, String location,
            Integer minCapacity, ResourceStatus status) {
        return resourceRepository.searchResources(type, location, minCapacity, status)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Search by name keyword
    public List<ResourceResponseDTO> searchByKeyword(String keyword) {
    return resourceRepository.findByNameContainingIgnoreCase(keyword)
            .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Helper: Entity → DTO
    private ResourceResponseDTO mapToDTO(Resource resource) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setCapacity(resource.getCapacity());
        dto.setLocation(resource.getLocation());
        dto.setAvailabilityWindows(resource.getAvailabilityWindows());
        dto.setStatus(resource.getStatus());
        dto.setDescription(resource.getDescription());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }
}