import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  LogOut, 
  Globe, 
  ChevronDown,
  Coins,
  Award
} from 'lucide-react'

const GEOGRAPHIC_SCOPES = [
  { id: 'neighborhood', name: 'Neighborhood', icon: '🏘️' },
  { id: 'city', name: 'City', icon: '🏙️' },
  { id: 'state', name: 'State', icon: '🗺️' },
  { id: 'country', name: 'Country', icon: '🇺🇸' },
  { id: 'continent', name: 'Continent', icon: '🌍' },
  { id: 'world', name: 'World', icon: '🌎' }
]

export default function Header({ user, onLogout, currentScope, onScopeChange }) {
  const location = useLocation()
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false)

  const currentScopeData = GEOGRAPHIC_SCOPES.find(s => s.id === currentScope)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">The Change App</h1>
              <p className="text-xs text-gray-500">Living Democracy</p>
            </div>
          </Link>

          {/* Geographic Scope Selector */}
          {user && location.pathname === '/' && (
            <div className="flex-1 max-w-md mx-8">
              <DropdownMenu open={scopeMenuOpen} onOpenChange={setScopeMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currentScopeData?.icon}</span>
                      <span>{currentScopeData?.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {GEOGRAPHIC_SCOPES.map((scope) => (
                    <DropdownMenuItem
                      key={scope.id}
                      onClick={() => {
                        onScopeChange(scope.id)
                        setScopeMenuOpen(false)
                      }}
                      className={currentScope === scope.id ? 'bg-blue-50' : ''}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{scope.icon}</span>
                        <span>{scope.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Token Display */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">{user.acents}</span>
                  <span className="text-yellow-600">ACents</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{user.dcents}</span>
                  <span className="text-blue-600">DCents</span>
                </div>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/register">
                <Button>Join The Change</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

