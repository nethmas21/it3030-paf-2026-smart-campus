import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Temporary placeholder pages (we will create these next)
function Home() {
  return <h2>Home Page</h2>;
}

function TicketListPage() {
  return <h2>Ticket List Page</h2>;
}

function CreateTicketPage() {
  return <h2>Create Ticket Page</h2>;
}

function App() {
  return (
    <Router>
      <div>
        <h1>Smart Campus System</h1>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/create" element={<CreateTicketPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;