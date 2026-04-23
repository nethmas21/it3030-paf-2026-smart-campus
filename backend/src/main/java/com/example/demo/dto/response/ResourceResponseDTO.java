package com.example.demo.dto.response;


import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private ResourceStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
