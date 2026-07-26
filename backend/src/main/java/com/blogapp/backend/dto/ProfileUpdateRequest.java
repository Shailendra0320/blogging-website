package com.blogapp.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @Size(max = 100, message = "Full name must be under 100 characters")
    private String fullName;

    @Size(max = 500, message = "Bio must be under 500 characters")
    private String bio;
}
