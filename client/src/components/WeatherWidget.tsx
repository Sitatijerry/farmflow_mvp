import { WeatherDataPoint } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";

interface WeatherWidgetProps {
  current?: WeatherDataPoint;
  forecast?: WeatherDataPoint[];
  loading?: boolean;
}

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-8 h-8 text-yellow-500" />,
  cloudy: <Cloud className="w-8 h-8 text-gray-400" />,
  rainy: <CloudRain className="w-8 h-8 text-blue-500" />,
  clear: <Sun className="w-8 h-8 text-yellow-500" />,
  partly_cloudy: <Cloud className="w-8 h-8 text-gray-400" />,
  overcast: <Cloud className="w-8 h-8 text-gray-500" />,
};

function getWeatherIcon(condition: string): React.ReactNode {
  const key = condition.toLowerCase().replace(/\s+/g, "_");
  return weatherIcons[key] || weatherIcons.cloudy;
}

export function WeatherWidget({
  current,
  forecast,
  loading,
}: WeatherWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No weather data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Current Conditions</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature and Condition */}
            <div className="flex items-center gap-3">
              {getWeatherIcon(current.condition)}
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(Number(current.temperature))}°C
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {current.condition}
                </p>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-semibold">{Math.round(Number(current.humidity))}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-semibold">{Math.round(Number(current.windSpeed))} km/h</p>
                <p className="text-xs text-muted-foreground">Wind</p>
              </div>
            </div>

            {/* Rainfall */}
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold">{Math.round(Number(current.rainfall))} mm</p>
                <p className="text-xs text-muted-foreground">Rainfall</p>
              </div>
            </div>
          </div>
        </div>

        {/* 72-Hour Forecast */}
        {forecast && forecast.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">Next 72 Hours</h3>
            <div className="grid grid-cols-3 gap-2">
              {forecast.slice(0, 3).map((day, idx) => (
                <div
                  key={idx}
                  className="bg-muted/50 rounded-lg p-3 text-center space-y-2"
                >
                  <div className="flex justify-center">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {Math.round(Number(day.temperature))}°C
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(Number(day.rainfall))} mm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert for high rainfall */}
        {current.rainfall && Number(current.rainfall) > 25 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ⚠️ Heavy rainfall expected. Consider adjusting irrigation schedules.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
