package com.example.demo.controller;

import com.example.demo.dto.request.BookingDecisionRequest;
import com.example.demo.dto.request.CreateBookingRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.BookingResponse;
import com.example.demo.entity.User;
import com.example.demo.enums.BookingStatus;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        String userId = principal.getAttribute("sub");
        BookingResponse response = bookingService.createBooking(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String userId = principal.getAttribute("sub");
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<BookingResponse> response = bookingService.getMyBookings(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("My bookings fetched successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BookingResponse> response = bookingService.getAllBookings(status, pageable);

        return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        String userId = principal.getAttribute("sub");

        User user = userRepository.findByGoogleId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        BookingResponse response = bookingService.getBookingById(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking fetched successfully", response));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingDecisionRequest request
    ) {
        BookingResponse response = bookingService.approveBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking approved successfully", response));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingDecisionRequest request
    ) {
        BookingResponse response = bookingService.rejectBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected successfully", response));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        String userId = principal.getAttribute("sub");

        User user = userRepository.findByGoogleId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        BookingResponse response = bookingService.cancelBooking(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }
}