import { FieldData } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Leaf,
  Droplets,
  Bug,
  Thermometer,
  Calendar,
} from "lucide-react";
import { differenceInDays } from "date-fns";

interface CropStatusPanelProps {
  field: FieldData;
}

const growthStagePercentage: Record<string, number> = {
  seedling: 20,
  vegetative: 40,
  flowering: 60,
  fruiting: 80,
  maturity: 100,
};

const growthStageColors: Record<string, string> = {
  seedling: "bg-yellow-500",
  vegetative: "bg-green-500",
  flowering: "bg-pink-500",
  fruiting: "bg-orange-500",
  maturity: "bg-amber-600",
};

export function CropStatusPanel({ field }: CropStatusPanelProps) {
  const growthProgress = growthStagePercentage[field.growthStage] || 0;
  const daysToMaturity =
    field.expectedHarvestDate &&
    differenceInDays(new Date(field.expectedHarvestDate), new Date());

  const waterStressLevel =
    field.waterStressIndex > 70 ? "high" : field.waterStressIndex > 40 ? "medium" : "low";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{field.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{field.cropType}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Growth Stage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Growth Stage</span>
            </div>
            <span className="text-sm font-semibold capitalize">
              {field.growthStage}
            </span>
          </div>
          <Progress
            value={growthProgress}
            className="h-2"
          />
        </div>

        {/* Days to Maturity */}
        {daysToMaturity !== null && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Days to Harvest</span>
            </div>
            <span className="text-sm font-bold">
              {daysToMaturity > 0 ? daysToMaturity : "Ready"}
            </span>
          </div>
        )}

        {/* Water Stress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Water Stress</span>
            </div>
            <span className="text-sm font-semibold">{field.waterStressIndex.toFixed(1)}%</span>
          </div>
          <Progress
            value={field.waterStressIndex}
            className="h-2"
          />
          {waterStressLevel === "high" && (
            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ High water stress - irrigation recommended
            </p>
          )}
          {waterStressLevel === "medium" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Moderate water stress - monitor closely
            </p>
          )}
        </div>

        {/* Soil Moisture */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium">Soil Moisture</span>
            </div>
            <span className="text-sm font-semibold">{field.soilMoisture.toFixed(1)}%</span>
          </div>
          <Progress
            value={field.soilMoisture}
            className="h-2"
          />
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">Temperature</span>
          </div>
          <span className="text-sm font-semibold">{field.temperature.toFixed(1)}°C</span>
        </div>

        {/* Pest Risk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Pest Risk</span>
            </div>
            <span className="text-sm font-semibold capitalize">
              {field.pestRiskLevel}
            </span>
          </div>
          {field.pestRiskLevel === "high" && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2">
              <p className="text-xs text-red-900 dark:text-red-100">
                🐛 High pest risk detected. Scout field and consider preventive measures.
              </p>
            </div>
          )}
          {field.pestRiskLevel === "medium" && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
              <p className="text-xs text-amber-900 dark:text-amber-100">
                🐛 Moderate pest risk. Monitor field regularly.
              </p>
            </div>
          )}
        </div>

        {/* Field Area */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
          <span className="font-medium">Field Area</span>
          <span className="font-semibold">{field.area.toFixed(2)} ha</span>
        </div>
      </CardContent>
    </Card>
  );
}
