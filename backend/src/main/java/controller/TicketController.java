package controller;


import dto.AssignTechnicianRequest;
import dto.CreateTicketRequest;
import dto.UpdateTicketStatusRequest;
import entity.Ticket;
import service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.createTicket(request);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id,
                               @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ticketService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/assign-technician")
    public Ticket assignTechnician(@PathVariable Long id,
                                   @Valid @RequestBody AssignTechnicianRequest request) {
        return ticketService.assignTechnician(id, request);
    }
}
