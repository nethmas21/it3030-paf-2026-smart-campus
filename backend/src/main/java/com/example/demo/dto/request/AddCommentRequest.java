package com.example.demo.dto.request;



import jakarta.validation.constraints.NotBlank;

public class AddCommentRequest {

    @NotBlank(message = "Comment content is required")
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
