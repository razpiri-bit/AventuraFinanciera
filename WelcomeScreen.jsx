import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { PlayCircle } from 'lucide-react'

const WelcomeScreen = ({ onVideoEnd, videoSrc }) => {
  const videoRef = useRef(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Autoplay prevented, showing controls:', error)
        setShowControls(true)
      })
    }
  }, [])

  const handleVideoEnd = () => {
    setVideoEnded(true)
  }

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setShowControls(false)
    }
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={handleVideoEnd}
        onPlay={() => setShowControls(false)}
        muted // Muted for autoplay to work in most browsers
      />
      
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Button 
            onClick={handlePlayButtonClick}
            className="text-white text-lg p-4 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <PlayCircle className="w-12 h-12" />
          </Button>
        </div>
      )}

      {videoEnded && (
        <div className="absolute bottom-10">
          <Button onClick={onVideoEnd} size="lg">
            Comenzar Aventura
          </Button>
        </div>
      )}
    </div>
  )
}

export default WelcomeScreen

