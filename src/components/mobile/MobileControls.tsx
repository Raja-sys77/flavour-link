import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  QrCode, 
  Mic, 
  MicOff, 
  Search,
  MapPin,
  Smartphone,
  X,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MobileControlsProps {
  className?: string;
}

const MobileControls: React.FC<MobileControlsProps> = ({ className }) => {
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Voice search functionality
  const startVoiceSearch = () => {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).speechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        performSearch(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Search Failed",
          description: "Please try again or use text search",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice search",
        variant: "destructive"
      });
    }
  };

  const performSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
    toast({
      title: "Search Started",
      description: `Searching for "${query}"`,
    });
  };

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use this feature",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Convert to blob and handle the image
      canvas.toBlob((blob) => {
        if (blob) {
          toast({
            title: "Photo Captured",
            description: "Photo captured successfully",
          });
          // Here you would typically upload the image or process it
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // QR Code scanning (basic implementation)
  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setShowQRScanner(true);
        
        // In a real implementation, you'd use a QR code library here
        toast({
          title: "QR Scanner Active",
          description: "Point camera at QR code to scan",
        });
      }
    } catch (error) {
      console.error('QR scanner error:', error);
      toast({
        title: "QR Scanner Failed",
        description: "Please allow camera access",
        variant: "destructive"
      });
    }
  };

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowQRScanner(false);
  };

  // Geolocation functionality
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          toast({
            title: "Location Found",
            description: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Access Denied",
            description: "Please allow location access",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your device doesn't support location services",
        variant: "destructive"
      });
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={className}>
      {/* Camera/QR Scanner Modal */}
      {(showCamera || showQRScanner) && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 text-white">
            <h3 className="text-lg font-semibold">
              {showCamera ? 'Camera' : 'QR Scanner'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={showCamera ? stopCamera : stopQRScanner}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {showCamera && (
            <div className="p-4 flex justify-center">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-200"
              >
                <Camera className="h-8 w-8" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Controls Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Search */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search products or say something..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={startVoiceSearch}
                disabled={isListening}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => performSearch(searchQuery)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {isListening && (
              <p className="text-sm text-muted-foreground text-center">
                🎤 Listening... Speak now
              </p>
            )}
          </div>

          {/* Camera & QR Scanner */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={startCamera}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button
              variant="outline"
              onClick={startQRScanner}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Scan
            </Button>
          </div>

          {/* Location Services */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={getCurrentLocation}
              className="w-full flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Get Current Location
            </Button>
            {location && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Touch Gestures Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Touch Gestures</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Swipe left/right to navigate</li>
              <li>• Long press for context menu</li>
              <li>• Pull down to refresh</li>
              <li>• Pinch to zoom (where applicable)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileControls;