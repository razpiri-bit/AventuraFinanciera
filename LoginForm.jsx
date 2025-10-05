import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'

const LoginForm = ({ onLogin, onShowRegistration }) => {
  const [nip, setNip] = useState('')
  const [showNip, setShowNip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nip.trim()) {
      setError('Por favor, ingresa tu NIP')
      return
    }

    if (nip.length !== 6) {
      setError('El NIP debe tener 6 caracteres')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`https://qjh9iec7wzzk.manus.space/api/auth/login/${nip}`)
      const data = await response.json()
      
      if (data.success) {
        onLogin(data.user)
      } else {
        setError('NIP incorrecto. Verifica que hayas ingresado el NIP correcto.')
      }
    } catch (error) {
      console.error('Error en el login:', error)
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNipChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 6)
    setNip(value)
    if (error) setError('')
  }

  return (
    <div className="adventure-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y Título */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            🏴‍☠️ Aventura Financiera
          </h1>
          <p className="text-lg text-blue-600">Isla del Tesoro</p>
        </div>

        {/* Formulario de Login */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu NIP para continuar tu aventura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nip">NIP de Acceso</Label>
                <div className="relative">
                  <Input
                    id="nip"
                    type={showNip ? "text" : "password"}
                    value={nip}
                    onChange={handleNipChange}
                    placeholder="Ej: MG1503"
                    className={`pr-10 text-center text-lg font-mono ${error ? 'border-red-500' : ''}`}
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowNip(!showNip)}
                  >
                    {showNip ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? 'Verificando...' : 'Iniciar Aventura'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                ¿No tienes una cuenta?
              </p>
              <Button 
                variant="outline" 
                onClick={onShowRegistration}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Información sobre el NIP */}
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona tu NIP?</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>2 letras:</strong> Iniciales de tu nombre y apellido</p>
              <p>• <strong>4 números:</strong> Día y mes de tu nacimiento</p>
              <p>• <strong>Ejemplo:</strong> María García (15 de marzo) = MG1503</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginForm

