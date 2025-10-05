import { useState, useEffect, useRef } from 'react'
import videoFinanzasPersonales from '../assets/videos/Animación_sobre_finanzas_personales.mp4'
import videoHuchaMagica from '../assets/videos/Video_Animado_De_La_Hucha_Mágica.mp4'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Coins, Star, ArrowLeft, CheckCircle } from 'lucide-react'

const GameModule = ({ module, onBack, onComplete, userProgress }) => {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [activityProgress, setActivityProgress] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState({})

  // Actividades específicas por módulo
  const moduleActivities = {
    1: [ // Puerto del Descubrimiento
      {
        type: 'video',
        title: 'Introducción a las Finanzas Personales',
        description: 'Mira este video para entender los conceptos básicos de las finanzas personales.',
        videoSrc: videoFinanzasPersonales
      },
      {
        type: 'quiz',
        title: '¿Qué son las finanzas?',
        question: '¿Cuál de estas opciones describe mejor las finanzas personales?',
        options: [
          'Solo el dinero que tienes en el banco',
          'La gestión de tu dinero: ingresos, gastos, ahorros e inversiones',
          'Únicamente los gastos que haces cada mes',
          'Solo las inversiones en la bolsa de valores'
        ],
        correct: 1,
        explanation: '¡Correcto! Las finanzas personales incluyen todo lo relacionado con la gestión de tu dinero.'
      },
      {
        type: 'decision',
        title: 'Tu primera decisión financiera',
        scenario: 'Recibes 50 monedas de oro como regalo. ¿Qué harías?',
        options: [
          { text: 'Gastarlas todas en dulces', coins: -10, feedback: 'Los dulces son ricos, pero gastar todo no es la mejor opción.' },
          { text: 'Ahorrar 30 y gastar 20 en algo que necesites', coins: 20, feedback: '¡Excelente! Equilibrar ahorro y gastos necesarios es muy sabio.' },
          { text: 'Ahorrar todo', coins: 10, feedback: 'Ahorrar está bien, pero también puedes disfrutar un poco.' },
          { text: 'Invertir en un pequeño negocio', coins: 15, feedback: 'Buena idea emprendedora, pero primero aprende más sobre inversiones.' }
        ]
      }
    ],
    2: [ // Valle de los Ingresos y Gastos
      {
        type: 'game',
        title: 'Clasifica Ingresos y Gastos',
        description: 'Arrastra cada elemento a la categoría correcta',
        items: [
          { text: 'Mesada semanal', type: 'ingreso' },
          { text: 'Comprar un juguete', type: 'gasto' },
          { text: 'Vender limonada', type: 'ingreso' },
          { text: 'Pagar el autobús', type: 'gasto' },
          { text: 'Regalo de cumpleaños', type: 'ingreso' },
          { text: 'Comprar útiles escolares', type: 'gasto' }
        ]
      }
    ],
    3: [ // Cueva del Ahorro
      {
        type: 'video',
        title: 'La Magia de la Hucha Mágica',
        description: 'Descubre cómo la Hucha Mágica te ayuda a ahorrar y alcanzar tus sueños.',
        videoSrc: videoHuchaMagica
      },
      {
        type: 'simulation',
        title: 'El Desafío del Ahorro',
        description: 'Demuestra cómo el ahorro constante hace crecer tu tesoro',
        goal: 'Ahorrar 100 monedas en 10 semanas',
        weeklyIncome: 15,
        expenses: [
          { name: 'Comida', amount: 5, required: true },
          { name: 'Transporte', amount: 2, required: true },
          { name: 'Entretenimiento', amount: 3, required: false },
          { name: 'Dulces', amount: 2, required: false }
        ]
      }
    ]
  }

  const getCurrentActivities = () => {
    return moduleActivities[module.id] || []
  }

  const handleAnswerSelect = (activityIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [activityIndex]: answerIndex
    }))
  }

  const handleActivityComplete = () => {
    const activities = getCurrentActivities()
    const activity = activities[currentActivity]
    let activityScore = 0

    if (activity.type === 'quiz') {
      activityScore = answers[currentActivity] === activity.correct ? 100 : 50
    } else if (activity.type === 'decision') {
      activityScore = 75 // Todas las decisiones dan puntos
    } else {
      activityScore = 80 // Otros tipos de actividades
    }

    const newScore = score + activityScore
    setScore(newScore)

    if (currentActivity < activities.length - 1) {
      setCurrentActivity(prev => prev + 1)
      setActivityProgress(((currentActivity + 1) / activities.length) * 100)
    } else {
      // Módulo completado
      onComplete(module.id, newScore)
    }
  }

  const renderQuizActivity = (activity, activityIndex) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{activity.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activity.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[activityIndex] === index ? "default" : "outline"}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => handleAnswerSelect(activityIndex, index)}
            >
              {option}
            </Button>
          ))}
        </div>
        {answers[activityIndex] !== undefined && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm">
              {answers[activityIndex] === activity.correct 
                ? activity.explanation 
                : 'Inténtalo de nuevo. Piensa en lo que has aprendido sobre finanzas.'}
            </p>
          </div>
        )}
        <Button 
          className="w-full mt-4" 
          onClick={handleActivityComplete}
          disabled={answers[activityIndex] === undefined}
        >
          Continuar
        </Button>
      </CardContent>
    </Card>
  )

  const renderDecisionActivity = (activity, activityIndex) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{activity.scenario}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activity.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[activityIndex] === index ? "default" : "outline"}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => handleAnswerSelect(activityIndex, index)}
            >
              <div>
                <div>{option.text}</div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Coins className="w-4 h-4 mr-1" />
                  {option.coins > 0 ? `+${option.coins}` : option.coins} monedas
                </div>
              </div>
            </Button>
          ))}
        </div>
        {answers[activityIndex] !== undefined && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm">
              {activity.options[answers[activityIndex]].feedback}
            </p>
          </div>
        )}
        <Button 
          className="w-full mt-4" 
          onClick={handleActivityComplete}
          disabled={answers[activityIndex] === undefined}
        >
          Continuar
        </Button>
      </CardContent>
    </Card>
  )

  const renderGameActivity = (activity) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{activity.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-lg mb-4">🎮 Juego Interactivo</p>
          <p className="text-gray-600 mb-6">
            Esta actividad requiere interacción más avanzada que se implementará en futuras versiones.
          </p>
          <Button onClick={handleActivityComplete}>
            Completar Actividad
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSimulationActivity = (activity) => {
    const [currentWeek, setCurrentWeek] = useState(0)
    const [currentSavings, setCurrentSavings] = useState(0)
    const [selectedOptionalExpenses, setSelectedOptionalExpenses] = useState([])
    const [feedback, setFeedback] = useState("")
    const [simulationComplete, setSimulationComplete] = useState(false)

    const totalWeeks = 10
    const goalSavings = 100

    useEffect(() => {
      // Resetear simulación al iniciar o cambiar de actividad
      setCurrentWeek(0)
      setCurrentSavings(0)
      setSelectedOptionalExpenses([])
      setFeedback("")
      setSimulationComplete(false)
    }, [activity])

    const handleExpenseToggle = (expenseName) => {
      setSelectedOptionalExpenses(prev =>
        prev.includes(expenseName)
          ? prev.filter(name => name !== expenseName)
          : [...prev, expenseName]
      )
    }

    const calculateWeeklyOutcome = () => {
      let weeklyExpenses = 0
      activity.expenses.forEach(exp => {
        if (exp.required) {
          weeklyExpenses += exp.amount
        } else if (selectedOptionalExpenses.includes(exp.name)) {
          weeklyExpenses += exp.amount
        }
      })
      const weeklyIncome = activity.weeklyIncome
      const netSavings = weeklyIncome - weeklyExpenses
      return netSavings
    }

    const handleNextWeek = () => {
      if (simulationComplete) return

      const netSavings = calculateWeeklyOutcome()
      const newSavings = currentSavings + netSavings
      setCurrentSavings(newSavings)
      setCurrentWeek(prev => prev + 1)

      if (newSavings >= goalSavings) {
        setFeedback("¡Felicidades! Has alcanzado tu meta de ahorro.")
        setSimulationComplete(true)
      } else if (currentWeek + 1 >= totalWeeks) {
        setFeedback(`Fin de la simulación. Ahorraste ${newSavings} monedas. ¡Sigue practicando para alcanzar tu meta!`) 
        setSimulationComplete(true)
      } else {
        setFeedback(`Semana ${currentWeek + 1} completada. Ahorro actual: ${newSavings} monedas.`) 
      }
      setSelectedOptionalExpenses([]) // Resetear gastos opcionales para la siguiente semana
    }

    const getProgressColor = (value) => {
      if (value >= goalSavings) return "bg-green-500"
      if (value >= goalSavings * 0.75) return "bg-yellow-500"
      return "bg-red-500"
    }

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
          <CardDescription>{activity.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Meta: {activity.goal}</h3>
              <Progress 
                value={(currentSavings / goalSavings) * 100} 
                className="h-4"
                indicatorColor={getProgressColor(currentSavings)}
              />
              <p className="text-sm mt-2">Ahorro actual: <span className="font-bold">{currentSavings}</span> / {goalSavings} monedas</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">Semana Actual:</p>
                <p className="text-3xl font-bold text-blue-600">{currentWeek + 1} / {totalWeeks}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Ingreso Semanal:</p>
                <p className="text-3xl font-bold text-green-600">+{activity.weeklyIncome} monedas</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Tus Gastos Semanales:</h4>
              <div className="space-y-2">
                {activity.expenses.map((exp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      {!exp.required && (
                        <input
                          type="checkbox"
                          checked={selectedOptionalExpenses.includes(exp.name)}
                          onChange={() => handleExpenseToggle(exp.name)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={simulationComplete}
                        />
                      )}
                      <span className={exp.required ? "font-medium" : ""}>{exp.name}</span>
                    </div>
                    <span className="text-red-500">-{exp.amount} monedas {exp.required && "> (Obligatorio)" }</span>
                  </div>
                ))}
              </div>
            </div>

            {feedback && (
              <div className="mt-4 p-3 rounded-md bg-blue-50 text-blue-800">
                {feedback}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button 
                onClick={handleNextWeek}
                disabled={simulationComplete}
                className="flex-1 mr-2"
              >
                {currentWeek < totalWeeks - 1 ? "Siguiente Semana" : "Finalizar Simulación"}
              </Button>
              <Button 
                onClick={() => onComplete(module.id, currentSavings >= goalSavings ? 100 : 50)}
                disabled={!simulationComplete}
                className="flex-1 ml-2"
              >
                Completar Módulo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderVideoActivity = (activity) => {
    const videoRef = useRef(null)
    const [videoEnded, setVideoEnded] = useState(false)

    useEffect(() => {
      setVideoEnded(false) // Reset when activity changes
    }, [activity])

    const handleVideoEnd = () => {
      setVideoEnded(true)
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
          <CardDescription>{activity.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="video-container mb-4">
            <video
              ref={videoRef}
              src={activity.videoSrc}
              controls
              className="w-full rounded-lg shadow-lg"
              onEnded={handleVideoEnd}
              onPlay={() => setVideoEnded(false)} // Reset if user replays
            />
          </div>
          <Button 
            className="w-full mt-4" 
            onClick={handleActivityComplete}
            disabled={!videoEnded}
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const activities = getCurrentActivities()
  const currentActivityData = activities[currentActivity]

  if (!currentActivityData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Módulo en Desarrollo</h2>
            <p className="text-gray-600 mb-6">
              Las actividades para este módulo están siendo desarrolladas.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Mapa
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="adventure-bg min-h-screen">
      {/* Header del Módulo */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-800">{module.title}</h1>
                <p className="text-gray-600">{module.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                Actividad {currentActivity + 1} de {activities.length}
              </Badge>
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-500" />
                <span className="font-bold">{score} pts</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={((currentActivity) / activities.length) * 100} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {currentActivityData.type === 'quiz' && renderQuizActivity(currentActivityData, currentActivity)}
        {currentActivityData.type === 'decision' && renderDecisionActivity(currentActivityData, currentActivity)}
        {currentActivityData.type === 'game' && renderGameActivity(currentActivityData)}
        {currentActivityData.type === 'simulation' && renderSimulationActivity(currentActivityData)}
        {currentActivityData.type === 'video' && renderVideoActivity(currentActivityData)}
      </div>
    </div>
  )
}

export default GameModule

