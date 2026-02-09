import { useEffect, useRef, useCallback, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import type { Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// Definiciones de conexiones faciales basadas en MediaPipe Face Mesh
// Cada par representa índices de landmarks que se conectan

const FACEMESH_LIPS: Array<[number, number]> = [
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375],
  [375, 291], [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267],
  [267, 269], [269, 270], [270, 409], [409, 291], [78, 95], [95, 88], [88, 178],
  [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324],
  [324, 308], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312],
  [312, 311], [311, 310], [310, 415], [415, 308]
];

const FACEMESH_LEFT_EYE: Array<[number, number]> = [
  [263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381],
  [381, 382], [382, 362], [263, 466], [466, 388], [388, 387], [387, 386],
  [386, 385], [385, 384], [384, 398], [398, 362]
];

const FACEMESH_LEFT_EYEBROW: Array<[number, number]> = [
  [276, 283], [283, 282], [282, 295], [295, 285], [300, 293], [293, 334],
  [334, 296], [296, 336]
];

const FACEMESH_LEFT_IRIS: Array<[number, number]> = [
  [474, 475], [475, 476], [476, 477], [477, 474]
];

const FACEMESH_RIGHT_EYE: Array<[number, number]> = [
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154],
  [154, 155], [155, 133], [33, 246], [246, 161], [161, 160], [160, 159],
  [159, 158], [158, 157], [157, 173], [173, 133]
];

const FACEMESH_RIGHT_EYEBROW: Array<[number, number]> = [
  [46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105],
  [105, 66], [66, 107]
];

const FACEMESH_RIGHT_IRIS: Array<[number, number]> = [
  [469, 470], [470, 471], [471, 472], [472, 469]
];

const FACEMESH_FACE_OVAL: Array<[number, number]> = [
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
  [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397],
  [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152],
  [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
  [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162],
  [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10]
];

// Triangulación simplificada (conexiones principales)
const FACEMESH_TESSELATION: Array<[number, number]> = [
  [127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11],
  [232, 231], [231, 120], [120, 232], [72, 37], [37, 0], [0, 72],
  [262, 369], [369, 267], [267, 262], [302, 269], [269, 291], [291, 302],
  [145, 52], [52, 64], [64, 145], [375, 291], [291, 308], [308, 375],
  [425, 200], [200, 421], [421, 425], [335, 424], [424, 406], [406, 335],
  [418, 421], [421, 200], [200, 418], [329, 435], [435, 406], [406, 329],
  [391, 429], [429, 423], [423, 391], [331, 416], [416, 433], [433, 331],
  [366, 447], [447, 345], [345, 366], [357, 350], [350, 452], [452, 357],
  [113, 225], [225, 224], [224, 113], [229, 228], [228, 117], [117, 229],
  [111, 117], [117, 228], [228, 111], [215, 214], [214, 207], [207, 215],
  [212, 202], [202, 204], [204, 212], [165, 92], [92, 186], [186, 165],
  [203, 206], [206, 98], [98, 203], [36, 101], [101, 205], [205, 36],
  [203, 98], [98, 129], [129, 203], [54, 68], [68, 104], [104, 54],
  [70, 63], [63, 105], [105, 70], [171, 140], [140, 170], [170, 171],
  [153, 155], [155, 133], [133, 153], [154, 145], [145, 144], [144, 154],
  [161, 163], [163, 246], [246, 161], [173, 155], [155, 157], [157, 173],
  [160, 159], [159, 158], [158, 160], [147, 123], [123, 116], [116, 147],
  [148, 176], [176, 149], [149, 148], [131, 25], [25, 110], [110, 131],
  [88, 178], [178, 87], [87, 88], [95, 78], [78, 191], [191, 95],
  [81, 82], [82, 13], [13, 81], [311, 311], [311, 402], [402, 311],
  [296, 336], [336, 9], [9, 296], [285, 8], [8, 417], [417, 285],
  [334, 296], [296, 293], [293, 334], [6, 122], [122, 196], [196, 6],
  [351, 6], [6, 419], [419, 351], [326, 2], [2, 393], [393, 326],
  [418, 262], [262, 431], [431, 418], [424, 335], [335, 406], [406, 424],
  [391, 429], [429, 423], [423, 391], [251, 389], [389, 356], [356, 251],
  [113, 225], [225, 224], [224, 113], [222, 221], [221, 189], [189, 222],
  [226, 113], [113, 207], [207, 226], [214, 192], [192, 203], [203, 214],
  [165, 92], [92, 186], [186, 165], [105, 66], [66, 107], [107, 105],
  [52, 65], [65, 55], [55, 52], [70, 63], [63, 105], [105, 70]
];

interface UseFaceMeshReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  isCameraActive: boolean;
  error: string | null;
  startCamera: () => void;
  stopCamera: () => void;
  landmarkCount: number;
}

export function useFaceMesh(): UseFaceMeshReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarkCount, setLandmarkCount] = useState(0);

  // Callback para procesar resultados
  const onResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el frame de video
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      setLandmarkCount(landmarks.length);

      // Dibujar conectores (líneas entre puntos)
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
        color: '#00FF00',
        lineWidth: 1
      });

      // Dibujar contornos de ojos
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
        color: '#FF3030',
        lineWidth: 2
      });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
        color: '#30FF30',
        lineWidth: 2
      });

      // Dibujar contornos de cejas
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: '#FF3030',
        lineWidth: 2
      });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: '#30FF30',
        lineWidth: 2
      });

      // Dibujar contorno de labios
      drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
        color: '#E0E0E0',
        lineWidth: 2
      });

      // Dibujar contorno de cara
      drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
        color: '#E0E0E0',
        lineWidth: 2
      });

      // Dibujar puntos faciales (los 468 landmarks)
      drawLandmarks(ctx, landmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 2
      });

      // Dibujar íris
      drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: '#FF3030',
        lineWidth: 2
      });
      drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, {
        color: '#30FF30',
        lineWidth: 2
      });
    } else {
      setLandmarkCount(0);
    }
  }, []);

  // Inicializar Face Mesh
  useEffect(() => {
    const initializeFaceMesh = async () => {
      try {
        setIsLoading(true);
        
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;
        setIsLoading(false);
      } catch (err) {
        setError('Error al inicializar Face Mesh: ' + (err as Error).message);
        setIsLoading(false);
      }
    };

    initializeFaceMesh();

    return () => {
      stopCamera();
      faceMeshRef.current?.close();
    };
  }, [onResults]);

  // Iniciar cámara
  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    const faceMesh = faceMeshRef.current;
    
    if (!video || !faceMesh) {
      setError('Face Mesh no está inicializado');
      return;
    }

    try {
      setError(null);
      
      const camera = new Camera(video, {
        onFrame: async () => {
          await faceMesh.send({ image: video });
        },
        width: 640,
        height: 480
      });

      cameraRef.current = camera;
      await camera.start();
      setIsCameraActive(true);
    } catch (err) {
      setError('Error al acceder a la cámara: ' + (err as Error).message);
    }
  }, []);

  // Detener cámara
  const stopCamera = useCallback(() => {
    cameraRef.current?.stop();
    cameraRef.current = null;
    setIsCameraActive(false);
    setLandmarkCount(0);
    
    // Limpiar canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isLoading,
    isCameraActive,
    error,
    startCamera,
    stopCamera,
    landmarkCount
  };
}
