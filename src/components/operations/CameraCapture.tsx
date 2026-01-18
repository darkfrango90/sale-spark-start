import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, X, FlipHorizontal2 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onCapture, onCancel }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get base64 image (without data:image/jpeg;base64, prefix)
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = imageDataUrl.split(",")[1];

    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    onCapture(base64);
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
        <div className="text-white text-center mb-8">
          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-2">Erro na Câmera</p>
          <p className="text-sm opacity-75">{error}</p>
        </div>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="lg"
          className="h-16 px-8 text-lg bg-white/10 border-white/30 text-white"
        >
          VOLTAR
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-xl">Iniciando câmera...</div>
          </div>
        )}

        {/* Guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-8 border-2 border-white/50 rounded-lg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">POSICIONE O TICKET</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black p-6 safe-area-inset-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Cancel button */}
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full text-white hover:bg-white/20"
          >
            <X className="h-8 w-8" />
          </Button>

          {/* Capture button */}
          <Button
            onClick={handleCapture}
            disabled={isInitializing}
            className="h-20 w-20 rounded-full bg-white hover:bg-gray-200 text-black shadow-xl"
          >
            <Camera className="h-10 w-10" />
          </Button>

          {/* Switch camera button */}
          <Button
            onClick={handleSwitchCamera}
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full text-white hover:bg-white/20"
          >
            <FlipHorizontal2 className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
