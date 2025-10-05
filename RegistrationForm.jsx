import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'

const RegistrationForm = ({ onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    edad: '',
    escuela: '',
    grado: '',
    fechaNacimiento: '',
    nombreTutor: '',
    emailTutor: ''
  })
  const [generatedNIP, setGeneratedNIP] = useState('')
  const [showNIP, setShowNIP] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos'
    if (!formData.edad || formData.edad < 6 || formData.edad > 17) {
      newErrors.edad = 'La edad debe estar entre 6 y 17 años'
    }
    if (!formData.escuela.trim()) newErrors.escuela = 'La escuela es requerida'
    if (!formData.grado.trim()) newErrors.grado = 'El grado es requerido'
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    if (!formData.nombreTutor.trim()) newErrors.nombreTutor = 'El nombre del tutor es requerido'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!formData.emailTutor.trim() || !emailRegex.test(formData.emailTutor)) {
      newErrors.emailTutor = 'Email válido del tutor es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateNIP = (nombre, apellidos, fechaNacimiento) => {
    // Obtener iniciales (primera letra del nombre y primera del primer apellido)
    const iniciales = (nombre.charAt(0) + apellidos.split(' ')[0].charAt(0)).toUpperCase()
    
    // Obtener fecha en formato DDMM
    const [year, month, day] = fechaNacimiento.split('-')
    const dia = day.padStart(2, '0')
    const mes = month.padStart(2, '0')
    
    return `${iniciales}${dia}${mes}`
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      // Generar NIP
      const nip = generateNIP(formData.nombre, formData.apellidos, formData.fechaNacimiento)
      setGeneratedNIP(nip)

      // Registrar usuario en el backend
      const response = await fetch("https://qjh9iec7wzzk.manus.space/api/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          nip: nip
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setIsRegistered(true)
      } else {
        alert('Error al registrar: ' + data.error)
      }
    } catch (error) {
      console.error('Error en el registro:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
    }
  }

  const copyNIP = () => {
    navigator.clipboard.writeText(generatedNIP)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogin = () => {
    onRegistrationComplete(generatedNIP)
  }

  if (isRegistered) {
    return (
      <div className="adventure-bg min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">¡Registro Exitoso! 🎉</CardTitle>
            <CardDescription>
              Tu aventura financiera está lista para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Tu NIP de Acceso:</h3>
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-blue-800">
                    {showNIP ? generatedNIP : '••••••'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNIP(!showNIP)}
                >
                  {showNIP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyNIP}
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>¡Importante!</strong> Guarda este NIP en un lugar seguro. 
                Lo necesitarás para acceder a tu aventura financiera.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Nombre:</strong> {formData.nombre} {formData.apellidos}</p>
              <p><strong>Edad:</strong> {formData.edad} años</p>
              <p><strong>Escuela:</strong> {formData.escuela}</p>
              <p><strong>Grado:</strong> {formData.grado}</p>
            </div>

            <Button onClick={handleLogin} className="w-full">
              Comenzar Mi Aventura Financiera
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="adventure-bg min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-blue-800">
            🏴‍☠️ ¡Únete a la Aventura Financiera!
          </CardTitle>
          <CardDescription className="text-lg">
            Completa tu registro para comenzar tu viaje en la Isla del Tesoro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Estudiante */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-700">Información del Estudiante</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: María"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>
                
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    placeholder="Ej: García López"
                    className={errors.apellidos ? 'border-red-500' : ''}
                  />
                  {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edad">Edad *</Label>
                  <Select onValueChange={(value) => handleInputChange('edad', parseInt(value))}>
                    <SelectTrigger className={errors.edad ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona tu edad" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 6).map(age => (
                        <SelectItem key={age} value={age.toString()}>{age} años</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.edad && <p className="text-red-500 text-sm mt-1">{errors.edad}</p>}
                </div>

                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    className={errors.fechaNacimiento ? 'border-red-500' : ''}
                  />
                  {errors.fechaNacimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="escuela">Escuela *</Label>
                  <Input
                    id="escuela"
                    value={formData.escuela}
                    onChange={(e) => handleInputChange('escuela', e.target.value)}
                    placeholder="Ej: Escuela Primaria Benito Juárez"
                    className={errors.escuela ? 'border-red-500' : ''}
                  />
                  {errors.escuela && <p className="text-red-500 text-sm mt-1">{errors.escuela}</p>}
                </div>

                <div>
                  <Label htmlFor="grado">Grado Escolar *</Label>
                  <Select onValueChange={(value) => handleInputChange('grado', value)}>
                    <SelectTrigger className={errors.grado ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona tu grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1° Primaria">1° Primaria</SelectItem>
                      <SelectItem value="2° Primaria">2° Primaria</SelectItem>
                      <SelectItem value="3° Primaria">3° Primaria</SelectItem>
                      <SelectItem value="4° Primaria">4° Primaria</SelectItem>
                      <SelectItem value="5° Primaria">5° Primaria</SelectItem>
                      <SelectItem value="6° Primaria">6° Primaria</SelectItem>
                      <SelectItem value="1° Secundaria">1° Secundaria</SelectItem>
                      <SelectItem value="2° Secundaria">2° Secundaria</SelectItem>
                      <SelectItem value="3° Secundaria">3° Secundaria</SelectItem>
                      <SelectItem value="1° Preparatoria">1° Preparatoria</SelectItem>
                      <SelectItem value="2° Preparatoria">2° Preparatoria</SelectItem>
                      <SelectItem value="3° Preparatoria">3° Preparatoria</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grado && <p className="text-red-500 text-sm mt-1">{errors.grado}</p>}
                </div>
              </div>
            </div>

            {/* Información del Tutor */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-700">Información del Tutor/Padre</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombreTutor">Nombre del Tutor *</Label>
                  <Input
                    id="nombreTutor"
                    value={formData.nombreTutor}
                    onChange={(e) => handleInputChange('nombreTutor', e.target.value)}
                    placeholder="Ej: Juan García"
                    className={errors.nombreTutor ? 'border-red-500' : ''}
                  />
                  {errors.nombreTutor && <p className="text-red-500 text-sm mt-1">{errors.nombreTutor}</p>}
                </div>

                <div>
                  <Label htmlFor="emailTutor">Email del Tutor *</Label>
                  <Input
                    id="emailTutor"
                    type="email"
                    value={formData.emailTutor}
                    onChange={(e) => handleInputChange('emailTutor', e.target.value)}
                    placeholder="Ej: juan.garcia@email.com"
                    className={errors.emailTutor ? 'border-red-500' : ''}
                  />
                  {errors.emailTutor && <p className="text-red-500 text-sm mt-1">{errors.emailTutor}</p>}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Sobre tu NIP:</strong> Se generará automáticamente usando las iniciales de tu nombre 
                y apellido, junto con tu fecha de nacimiento (día y mes). Por ejemplo: 
                María García nacida el 15 de marzo = MG1503
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Registrarme y Generar mi NIP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegistrationForm

