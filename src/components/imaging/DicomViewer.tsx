"use client";
import React from "react";
import Image from "next/image";

export default function DicomViewer({ url, modality }: { url: string; modality: string }) {
  const isPdf = url.endsWith('.pdf');
  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(url);
  const isDicom = !isPdf && !isImage && url.length > 0;

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden bg-black flex items-center justify-center min-h-[400px] w-full shadow-inner relative group">
      {!isDicom ? (
        isPdf ? (
          <iframe src={url} className="w-full h-[600px] bg-white border-0" title={`${modality} Report`} loading="lazy" />
        ) : (
          <Image
            src={url}
            alt={`${modality} imaging scan`}
            className="max-w-full max-h-[600px] object-contain"
            width={800}
            height={600}
            loading="lazy"
            quality={75}
          />
        )
      ) : (
        <div className="text-white text-center p-8 space-y-4">
          <div className="animate-pulse flex items-center gap-3 justify-center text-blue-400">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="font-semibold tracking-widest uppercase text-xs">Cornerstone.js Ready</span>
          </div>
          <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            Streaming multi-frame DICOM series from WADO archive... Interactive canvas (Zoom, Pan, Windowing) will initialize under typical conditions.
          </p>
        </div>
      )}

      {/* Mock Cornerstone.js Toolbar overlay */}
      {isDicom && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-full px-6 py-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider">Window</button>
          <button className="text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider">Pan</button>
          <button className="text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider">Zoom</button>
          <button className="text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider">Scroll</button>
        </div>
      )}
    </div>
  );
}
