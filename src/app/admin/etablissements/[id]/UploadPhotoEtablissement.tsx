"use client";

import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadPhotoEtablissement({ etablissementId, currentPath, onUploaded }: {
  etablissementId: string;
  currentPath?: string | null;
  onUploaded?: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Affiche la photo actuelle si présente
  useEffect(() => {
    if (currentPath) {
      const { data } = supabase.storage.from("etablissements").getPublicUrl(currentPath);
      setPreview(data.publicUrl);
    } else {
      setPreview("");
    }
  }, [currentPath]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const ext = file.name.split('.').pop();
    const filePath = `etablissements/${etablissementId}/main.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("etablissements")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError("Erreur lors de l’upload : " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("etablissements").getPublicUrl(filePath);
    setPreview(data.publicUrl);
    setUploading(false);
    if (onUploaded) onUploaded(filePath);
  }

  function triggerFileInput() {
    fileInput.current?.click();
  }

  return (
    <div className="space-y-4">
      {preview && (
        <img src={preview} alt="Photo établissement" className="max-w-full max-h-48 rounded border" />
      )}
      <button
        type="button"
        onClick={triggerFileInput}
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
        disabled={uploading}
      >
        Choisir une photo…
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      {uploading && <div className="text-blue-600">Envoi en cours…</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
