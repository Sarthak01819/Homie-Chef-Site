import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'
import History from './pages/History'
import Subscription from './pages/Subscription'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Home from './components/Home'

function App() {
  return (
    <div className="App ">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </div>
  )
}

export default App
