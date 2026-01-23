import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      {/* <Login /> */}
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;

