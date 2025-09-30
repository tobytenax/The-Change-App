import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'

// Components
import Header from './components/Header'
import Registration from './components/Registration'
import Tutorial from './components/Tutorial'
import MainFeed from './components/MainFeed'
import ProposalView from './components/ProposalView'
import UserProfile from './components/UserProfile'

// Configure axios
axios.defaults.baseURL = 'http://localhost:3001'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentScope, setCurrentScope] = useState('neighborhood')

  useEffect(() => {
    // Check if user is logged in (has private key and user data)
    const privateKey = localStorage.getItem('changeapp_private_key')
    const savedUser = localStorage.getItem('changeapp_user')
    
    if (privateKey && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Refresh user data from server
        refreshUserData(userData.username)
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        localStorage.removeItem('changeapp_user')
        localStorage.removeItem('changeapp_private_key')
      }
    }
    setLoading(false)
  }, [])

  const refreshUserData = async (username) => {
    try {
      const response = await axios.get(`/api/users/${username}`)
      const userData = response.data
      setUser(userData)
      localStorage.setItem('changeapp_user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('changeapp_user', JSON.stringify(userData))
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('changeapp_user', JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('changeapp_user')
    localStorage.removeItem('changeapp_private_key')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading The Change App...</p>
        </div>
      </div>
    )
  }

  // Determine user's onboarding status
  const needsRegistration = !user
  const needsTutorial = user && user.acents === 0
  const canAccessMainApp = user && user.acents > 0

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user} 
          onLogout={handleLogout}
          currentScope={currentScope}
          onScopeChange={setCurrentScope}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Registration flow for new users */}
            {needsRegistration && (
              <Route 
                path="/*" 
                element={<Registration onLogin={handleLogin} />} 
              />
            )}
            
            {/* Tutorial for users who haven't earned their first ACent */}
            {needsTutorial && (
              <Route 
                path="/*" 
                element={
                  <Tutorial 
                    user={user} 
                    onUserUpdate={handleUserUpdate} 
                  />
                } 
              />
            )}
            
            {/* Main app for users who completed tutorial */}
            {canAccessMainApp && (
              <>
                <Route 
                  path="/" 
                  element={
                    <MainFeed 
                      user={user} 
                      scope={currentScope}
                      onUserUpdate={handleUserUpdate}
                    />
                  } 
                />
                <Route 
                  path="/proposal/:id" 
                  element={
                    <ProposalView 
                      user={user} 
                      onUserUpdate={handleUserUpdate}
                    />
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <UserProfile 
                      user={user} 
                      onUserUpdate={handleUserUpdate}
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 mt-16">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p className="mb-2">
              <strong>The Change App</strong> - Revolutionary Living Democracy Platform
            </p>
            <p className="text-sm">
              Founded on the Digital Bill of Rights • Governed by the Change App Democratic License (CADL)
            </p>
            <p className="text-xs mt-2 text-gray-500">
              "From block to block, we'll ACend higher and higher" - TAObaeus Rushaeus
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

