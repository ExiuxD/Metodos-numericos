import { useFaceMesh } from './hooks/useFaceMesh';
import { Camera, CameraOff, Activity, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import './App.css';

function App() {
  const {
    videoRef,
    canvasRef,
    isLoading,
    isCameraActive,
    error,
    startCamera,
    stopCamera,
    landmarkCount
  } = useFaceMesh();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            MediaPipe Face Mesh
          </h1>
          <p className="text-slate-400 text-lg">
            Detección de 468 puntos faciales 3D en tiempo real
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-500 bg-red-950/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-slate-400">
                <Activity className="h-6 w-6 animate-spin" />
                <span className="text-lg">Cargando modelo de Face Mesh...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!isLoading && (
          <>
            {/* Video Canvas Container */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-400" />
                      Vista de la Cámara
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Los puntos rojos representan los 468 landmarks faciales detectados
                    </CardDescription>
                  </div>
                  {isCameraActive && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                      Activo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black flex justify-center">
                  {/* Video element (hidden, used for processing) */}
                  <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                  />
                  
                  {/* Canvas for drawing landmarks */}
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="max-w-full h-auto"
                  />
                  
                  {/* Overlay when camera is off */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90">
                      <CameraOff className="h-16 w-16 text-slate-600 mb-4" />
                      <p className="text-slate-400 text-lg">Cámara desactivada</p>
                      <p className="text-slate-500 text-sm mt-1">
                        Haz clic en "Iniciar Cámara" para comenzar
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Control Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    {!isCameraActive ? (
                      <Button 
                        onClick={startCamera}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Iniciar Cámara
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopCamera}
                        variant="destructive"
                        className="flex-1"
                      >
                        <CameraOff className="h-4 w-4 mr-2" />
                        Detener Cámara
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Puntos Detectados</p>
                      <p className={`text-3xl font-bold ${landmarkCount > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                        {landmarkCount}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">de 468</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-slate-400 text-sm mb-1">Estado</p>
                      <p className={`text-lg font-semibold ${isCameraActive ? 'text-green-400' : 'text-slate-500'}`}>
                        {isCameraActive ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      <span className="text-green-400 font-semibold">Líneas verdes:</span> Malla de triangulación facial
                    </p>
                    <p className="text-slate-300">
                      <span className="text-red-400 font-semibold">Puntos rojos:</span> Landmarks faciales (468 puntos)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      <span className="text-blue-400 font-semibold">Ojos:</span> Contornos en rojo (derecho) y verde (izquierdo)
                    </p>
                    <p className="text-slate-300">
                      <span className="text-gray-300 font-semibold">Labios y cara:</span> Contornos principales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-slate-500 text-sm pt-4">
              <p>Programa creado con MediaPipe Face Mesh + React + TypeScript</p>
              <p className="mt-1">Punto 17 - Laboratorio de Procesamiento de Imágenes</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
