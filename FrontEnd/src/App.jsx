// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Layout/NavBar';
import Footer from './Components/Layout/Footer';
import Home from './Pages/Home';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Services from './Pages/Services';
import Rentals from './Pages/Rentals';
import CarWash from './Pages/CarWash';
import Repairs from './Pages/Repairs';
import Sales from './Pages/Sales';
import Booking from './Pages/Booking';

// Styles
import './Styles/Variables.css';
import './Styles/Animations.css';
import './Styles/Global.css';
import './Styles/Layout.css';
import './Styles/Home.css';
import './Styles/About.css';
import './Styles/Contact.css';
import './Styles/Rentals.css';
import './Styles/CarWash.css';
import './Styles/Repairs.css';
import './Styles/Sales.css';
import './Styles/Booking.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/car-wash" element={<CarWash />} />
            <Route path="/repairs" element={<Repairs />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/booking" element={<Booking />} />
            {/* Other routes will be added as we build pages */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;