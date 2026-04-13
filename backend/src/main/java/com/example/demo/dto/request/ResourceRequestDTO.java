package com.example.demo.dto.request;


import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1)
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;
    private ResourceStatus status;
    private String description;
}