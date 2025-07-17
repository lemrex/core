// "use client"

// import { useState } from "react"
// import Dashboard from "./pages/Dashboard"
// import Login from "./pages/Login"
// import "./App.css"

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)

//   const handleLogin = () => {
//     setIsAuthenticated(true)
//   }

//   const handleLogout = () => {
//     setIsAuthenticated(false)
//   }

//   return (
//     <div className="App">
//       {isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
//     </div>
//   )
// }

// export default App



"use client"

import { useState } from "react"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <div className="App">
      {/* 👇 ToastContainer appears on all pages */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
    </div>
  )
}

export default App
