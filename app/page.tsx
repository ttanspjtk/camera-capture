"use client";

import { useRef, useState, useEffect } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async (): Promise<void> => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // Use "user" for front camera
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Camera access denied:", error);
        }
      }
    };

    startCamera();

    return (): void => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhoto = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      setPhoto(imageData);
    }
  };

  return (
    <div className="p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md rounded shadow"
        style={{ display: "none" }}
      />
      <button
        onClick={takePhoto}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        Take Photo
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ maxWidth: "200px", padding: 2 }}>{photo}</div>
      {photo && (
        <div className="mt-4">
          <p>Captured Photo:</p>
          <img src={photo} alt="Captured" className="rounded border mt-2" />
        </div>
      )}
    </div>
  );
}
