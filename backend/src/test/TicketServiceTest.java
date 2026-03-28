package com.smartcampus;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.dto.response.TicketResponse;
import com.smartcampus.entity.Ticket;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository commentRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        sampleTicket = new Ticket();
        sampleTicket.setId(1L);
        sampleTicket.setTitle("Projector broken in Lab A");
        sampleTicket.setDescription("Projector not turning on");
        sampleTicket.setCategory(TicketCategory.IT_EQUIPMENT);
        sampleTicket.setPriority(TicketPriority.HIGH);
        sampleTicket.setStatus(TicketStatus.OPEN);
        sampleTicket.setCreatedBy("user-123");
        sampleTicket.setAttachmentPaths(new ArrayList<>());
        sampleTicket.setComments(new ArrayList<>());
    }

    @Test
    @DisplayName("createTicket — should save and return ticket response")
    void createTicket_shouldSaveAndReturn() {
        CreateTicketRequest req = new CreateTicketRequest();
        req.setTitle("Projector broken in Lab A");
        req.setDescription("Projector not turning on");
        req.setCategory(TicketCategory.IT_EQUIPMENT);
        req.setPriority(TicketPriority.HIGH);

        when(ticketRepository.save(any(Ticket.class))).thenReturn(sampleTicket);

        TicketResponse result = ticketService.createTicket(req, "user-123");

        assertThat(result.getTitle()).isEqualTo("Projector broken in Lab A");
        assertThat(result.getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(result.getCreatedBy()).isEqualTo("user-123");
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    @DisplayName("getTicketById — should throw when ticket not found")
    void getTicketById_shouldThrowWhenNotFound() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicketById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Ticket not found with id: 99");
    }

    @Test
    @DisplayName("updateStatus — valid OPEN → IN_PROGRESS transition should succeed")
    void updateStatus_validTransition_shouldSucceed() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any())).thenReturn(sampleTicket);

        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(TicketStatus.IN_PROGRESS);

        TicketResponse result = ticketService.updateStatus(1L, req, "TECHNICIAN");
        assertThat(result).isNotNull();
        verify(ticketRepository).save(any());
    }

    @Test
    @DisplayName("updateStatus — invalid CLOSED → OPEN transition should throw")
    void updateStatus_invalidTransition_shouldThrow() {
        sampleTicket.setStatus(TicketStatus.CLOSED);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));

        UpdateTicketStatusRequest req = new UpdateTicketStatusRequest();
        req.setStatus(TicketStatus.OPEN);

        assertThatThrownBy(() -> ticketService.updateStatus(1L, req, "TECHNICIAN"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    @DisplayName("deleteTicket — should delete when ticket exists")
    void deleteTicket_shouldDelete() {
        when(ticketRepository.existsById(1L)).thenReturn(true);
        ticketService.deleteTicket(1L);
        verify(ticketRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteTicket — should throw when ticket does not exist")
    void deleteTicket_shouldThrowWhenNotFound() {
        when(ticketRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> ticketService.deleteTicket(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
