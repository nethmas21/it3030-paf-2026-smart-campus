package service;



import dto.AssignTechnicianRequest;
import dto.CreateTicketRequest;
import dto.UpdateTicketStatusRequest;
import entity.Ticket;
import repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(CreateTicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setLocation(request.getLocation());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy("demo-user");
        ticket.setStatus(Ticket.TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public Ticket updateStatus(Long id, UpdateTicketStatusRequest request) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(request.getStatus());

        if (request.getStatus() == Ticket.TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        if (request.getStatus() == Ticket.TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(Long id, AssignTechnicianRequest request) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTechnician(request.getTechnicianName());
        return ticketRepository.save(ticket);
    }
}