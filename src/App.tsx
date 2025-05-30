import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BookmarkProvider } from './context/BookmarkContext'
import AuthPage from './pages/auth/AuthPage'
import HomePage from './pages/home/HomePage'
import PrivateRoute from './components/layout/PrivateRoute'
import { ToastProvider } from './components/ui/simple-toast'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BookmarkProvider>
          <BrowserRouter>
            <Routes>
            {/* Redirect root to auth page */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Auth route */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<HomePage />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </BrowserRouter>
        </BookmarkProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
