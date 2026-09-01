import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, Check } from "lucide-react";
import { useI18n } from "../lib/i18n";

export default function PhotoCapture({
  onCapture,
}: {
  onCapture: (dataUrl: string) => void;
}) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError(t.photo.error);
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.8));
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setActive(false);
  }

  function retake() {
    setPhoto(null);
    start();
  }

  return (
    <div>
      {!active && !photo && (
        <button
          onClick={start}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-700 transition hover:bg-emerald-50"
        >
          <Camera className="h-10 w-10" />
          <span className="font-semibold">{t.photo.open}</span>
        </button>
      )}

      {active && (
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} playsInline muted className="h-64 w-full object-cover" />
          <button
            onClick={capture}
            className="absolute inset-x-0 bottom-4 mx-auto flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-emerald-700 shadow-lg"
          >
            <Camera className="h-5 w-5" /> {t.photo.capture}
          </button>
        </div>
      )}

      {photo && (
        <div>
          <img src={photo} alt="Captured lot" className="h-56 w-full rounded-2xl object-cover" />
          <div className="mt-2 flex gap-2">
            <button
              onClick={retake}
              className="btn-outline flex flex-1 items-center justify-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> {t.photo.retake}
            </button>
            <button
              onClick={() => onCapture(photo)}
              className="btn-brand flex flex-1 items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" /> {t.photo.use}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
