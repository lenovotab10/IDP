
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Hero from './Components/Hero'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
      </Routes>
    </Router>
  )
}

export default App

