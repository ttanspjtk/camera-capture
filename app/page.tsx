"use client";

import React, { useRef, useState, useEffect } from "react";

interface Photo {
  id: string;
  dataUrl: string;
}

export default function Home(): JSX.Element {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setIsMobile(isTouch);
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (): void => {
        const result = reader.result;
        if (typeof result === "string") {
          setPhotos((prev) => [...prev, { id: generateId(), dataUrl: result }]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleDownload = (photo: Photo) => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `photo-${photo.id}.png`;
    a.click();
  };

  const uploadPhoto = async (photo: Photo): Promise<boolean> => {
    try {
      const blob = await (await fetch(photo.dataUrl)).blob();
      const file = new File([blob], `photo-${photo.id}.png`, {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return res.ok;
    } catch (err) {
      console.error("Upload error:", err);
      return false;
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const results = await Promise.all(photos.map(uploadPhoto));

    if (results.every((r) => r)) {
      alert("✅ All photos uploaded successfully!");
    } else {
      alert("⚠️ Some uploads failed.");
    }

    setUploading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {isMobile && (
        <>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="mb-4"
          />

          {photos.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="border p-2 rounded shadow">
                    <img
                      src={photo.dataUrl}
                      alt="Captured"
                      className="rounded w-full"
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleDownload(photo)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadAll}
                className="w-full bg-blue-600 text-white py-2 rounded"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload All"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
