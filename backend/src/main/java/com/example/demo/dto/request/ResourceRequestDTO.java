package com.example.demo.dto.request;


import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Resource Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])[a-zA-Z0-9 ]+$",
        message = "Resource name can only contain letters, numbers, and spaces - cannot be only numbers"
    )
    private String name;

    @NotNull(message = "Resource Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity cannot exceed 10000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 200, message = "Location must be between 2 and 200 characters")
    @Pattern(
        // allow commas in location, e.g. "Block A, Floor 1"
        regexp = "^(?=.*[a-zA-Z])[a-zA-Z0-9, ]+$",
        message = "Location can only contain letters, numbers, spaces, and commas - cannot be only numbers"
    )
    private String location;

    @Pattern(
        regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$|^$",
        message = "Availability format must be HH:MM-HH:MM (e.g. 08:00-18:00)"
    )

    private String availabilityWindows;
    private ResourceStatus status;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}