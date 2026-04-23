package com.example.demo.dto.response;

import java.util.List;

public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String picture;
    private List<String> roles;
    private String authProvider;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }
}
