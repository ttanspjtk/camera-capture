"use client";

import React, { useRef, useState, useEffect } from "react";

export default function Home(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
        <>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="mb-4"
          />

          <div className="mx-4">{photo}</div>
          {photo && (
            <div className="mt-4">
              <p>Captured Photo:</p>
              <img src={photo} alt="Captured" className="rounded border mt-2" />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
