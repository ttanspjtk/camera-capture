"use client";

import React, { useRef, useState, useEffect } from "react";

export default function Home(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect if mobile device
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(isTouch);
  }, []);

  // Start live camera if not mobile
  useEffect(() => {
    if (!isMobile) {
      const startCamera = async (): Promise<void> => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Failed to access camera:", err);
        }
      };

      startCamera();

      return (): void => {
        if (videoRef.current?.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop());
        }
      };
    }
  }, [isMobile]);

  const takePhoto = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = canvas.toDataURL("image/png");
      setPhoto(img);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (): void => {
        const result = reader.result;
        if (typeof result === "string") {
          setPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {isMobile ? (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="mb-4"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded shadow w-full"
          />
          <button
            onClick={takePhoto}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Take Photo
          </button>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="mx-4">{photo}</div>
      {photo && (
        <div className="mt-4">
          <p>Captured Photo:</p>
          <img src={photo} alt="Captured" className="rounded border mt-2" />
        </div>
      )}
    </div>
  );
}
