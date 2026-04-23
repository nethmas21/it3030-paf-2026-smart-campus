package com.example.demo.dto.response;

import com.example.demo.entity.User;

public class UserResponse {
    private String googleId;
    private String name;
    private String email;
    private String picture;
    private User.Role role;

    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
}
