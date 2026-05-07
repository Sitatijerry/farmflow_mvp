import { useEffect, useRef } from "react";
import { FieldData } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface FieldMapProps {
  fields: FieldData[];
  selectedFieldId?: string;
  onFieldSelect?: (fieldId: string) => void;
  height?: string;
}

export function FieldMap({
  fields,
  selectedFieldId,
  onFieldSelect,
  height = "400px",
}: FieldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map centered on first field or default location
    const center = fields.length > 0
      ? {
          lat: Number(fields[0].latitude) || 0,
          lng: Number(fields[0].longitude) || 0,
        }
      : { lat: 0, lng: 0 };

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each field
    fields.forEach((field) => {
      const position = {
        lat: Number(field.latitude) || 0,
        lng: Number(field.longitude) || 0,
      };

      const isSelected = field.id === selectedFieldId;

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: field.name,
        icon: isSelected
          ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      });

      marker.addListener("click", () => {
        onFieldSelect?.(field.id);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${field.name}</h3>
            <p style="margin: 0 0 2px 0; font-size: 12px;">${field.cropType}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">Area: ${field.area.toFixed(2)} ha</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (fields.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      fields.forEach((field) => {
        bounds.extend({
          lat: Number(field.latitude) || 0,
          lng: Number(field.longitude) || 0,
        });
      });
      map.fitBounds(bounds);
    }
  }, [fields, selectedFieldId, onFieldSelect]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Field Map
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          ref={mapRef}
          style={{ height }}
          className="rounded-lg border overflow-hidden"
        />

        {/* Field List */}
        {fields.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Fields</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => onFieldSelect?.(field.id)}
                  className={`text-left p-2 rounded-lg border transition-colors ${
                    selectedFieldId === field.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-sm font-medium">{field.name}</p>
                  <p className="text-xs text-muted-foreground">{field.cropType}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No fields to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
