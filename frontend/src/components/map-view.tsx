"use client";

/// <reference types="google.maps" />
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare const google: typeof globalThis.google;

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise<void>((resolve) => {
    const existing = document.querySelector(`script[data-maps-proxy]`);
    if (existing) return resolve();
    const script = document.createElement("script");
    script.dataset.mapsProxy = "true";
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => console.error("Failed to load Google Maps script");
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    loadMapScript().then(() => {
      if (!mapContainer.current || !window.google) return;
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });
      onMapReady?.(map.current);
    });
  }, [initialCenter, initialZoom, onMapReady]);

  return <div ref={mapContainer} className={cn("w-full h-125", className)} />;
}
