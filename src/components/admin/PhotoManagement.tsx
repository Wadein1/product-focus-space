import React from 'react';
import { UploadForm } from "./gallery/UploadForm";
import { ImageGrid } from "./gallery/ImageGrid";

export function PhotoManagement() {
  return (
    <div className="space-y-6">
      <UploadForm />
      <ImageGrid />
    </div>
  );
}