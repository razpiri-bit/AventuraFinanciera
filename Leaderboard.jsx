import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Trophy, Medal, Award, Star, Coins, ArrowLeft } from 'lucide-react'

const Leaderboard = ({ onBack }) => {
  const [highScores, setHighScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHighScores()
  }, [])

  const fetchHighScores = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://qjh9iec7wzzk.manus.space/api/game/highscores')
      const data = await response.json()
      
      if (data.success) {
        setHighScores(data.data)
      } else {
        setError('Error al cargar las puntuaciones')
      }
    } catch (err) {
      console.error('Error fetching high scores:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <Star className="w-6 h-6 text-blue-500" />
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
    }
  }

  const getModuleName = (moduleId) => {
    const moduleNames = {
      1: 'Puerto del Descubrimiento',
      2: 'Valle de Ingresos y Gastos',
      3: 'Cueva del Ahorro',
      4: 'Mercado del Emprendedor',
      5: 'Bosque de la Honestidad',
      6: 'Fuente del Crecimiento',
      7: 'Montañas de los Desafíos',
      8: 'Cima del Éxito'
    }
    return moduleNames[moduleId] || `Módulo ${moduleId}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStudentInitials = (nip) => {
    // Extraer las iniciales del NIP (primeros 2 caracteres)
    return nip.substring(0, 2).toUpperCase()
  }

  const getStudentBirthMonth = (nip) => {
    // Extraer el mes de nacimiento del NIP (caracteres 3-4)
    const month = nip.substring(2, 4)
    const monthNames = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    }
    return monthNames[month] || 'Desconocido'
  }

  if (loading) {
    return (
      <div className="adventure-bg min-h-screen">
        <header className="bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold text-blue-800">🏆 Tabla de Puntuaciones</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Cargando puntuaciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="adventure-bg min-h-screen">
        <header className="bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold text-blue-800">🏆 Tabla de Puntuaciones</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchHighScores}>Reintentar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="adventure-bg min-h-screen">
      <header className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold text-blue-800">🏆 Tabla de Puntuaciones</h1>
              <Badge variant="secondary" className="text-lg">
                Top 10 Aventureros
              </Badge>
            </div>
            <Button onClick={fetchHighScores} variant="outline">
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {highScores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-600 mb-2">
                  ¡Sé el primero en aparecer aquí!
                </h2>
                <p className="text-gray-500">
                  Completa los módulos y obtén puntuaciones altas para aparecer en la tabla de líderes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Top 3 destacados */}
              {highScores.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {highScores.slice(0, 3).map((score, index) => (
                    <Card key={score.rank} className={`${getRankColor(score.rank)} border-0 shadow-lg transform hover:scale-105 transition-all duration-300`}>
                      <CardContent className="text-center py-6">
                        <div className="flex justify-center mb-3">
                          {getRankIcon(score.rank)}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">#{score.rank}</h3>
                        <div className="text-lg font-semibold mb-2">
                          {getStudentInitials(score.student_nip)}
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          {getStudentBirthMonth(score.student_nip)}
                        </div>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <Star className="w-4 h-4" />
                          <span className="text-xl font-bold">{score.score}</span>
                        </div>
                        <div className="text-xs opacity-80">
                          {getModuleName(score.module_id)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Lista completa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span>Ranking Completo</span>
                  </CardTitle>
                  <CardDescription>
                    Las mejores puntuaciones de todos los aventureros financieros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {highScores.map((score) => (
                      <div
                        key={`${score.student_nip}-${score.module_id}-${score.achieved_at}`}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                          score.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
                            {getRankIcon(score.rank)}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">
                              #{score.rank} - {getStudentInitials(score.student_nip)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getStudentBirthMonth(score.student_nip)} • {getModuleName(score.module_id)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(score.achieved_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-blue-600">
                              {score.score}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">puntos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="text-center py-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    🌟 ¿Cómo aparecer en el ranking?
                  </h3>
                  <p className="text-blue-700">
                    Completa los módulos de la Isla del Tesoro Financiero y obtén las mejores puntuaciones. 
                    ¡Cada respuesta correcta y decisión inteligente te acerca más al top!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
