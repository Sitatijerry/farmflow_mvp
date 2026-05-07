import { RecommendationData, RecommendationAction } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Droplet,
  Leaf,
  Eye,
  Scissors,
  Bug,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface RecommendationCardProps {
  recommendation: RecommendationData;
  fieldName?: string;
  onAcknowledge?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

const actionIcons: Record<RecommendationAction, React.ReactNode> = {
  irrigate: <Droplet className="w-5 h-5" />,
  block_fertiliser: <Leaf className="w-5 h-5" />,
  scout_field: <Eye className="w-5 h-5" />,
  prepare_harvest: <Scissors className="w-5 h-5" />,
  apply_pesticide: <Bug className="w-5 h-5" />,
  reduce_irrigation: <Droplet className="w-5 h-5" />,
  increase_nitrogen: <Leaf className="w-5 h-5" />,
  monitor_pest: <Eye className="w-5 h-5" />,
};

const actionLabels: Record<RecommendationAction, string> = {
  irrigate: "Irrigate",
  block_fertiliser: "Block Fertiliser",
  scout_field: "Scout Field",
  prepare_harvest: "Prepare Harvest",
  apply_pesticide: "Apply Pesticide",
  reduce_irrigation: "Reduce Irrigation",
  increase_nitrogen: "Increase Nitrogen",
  monitor_pest: "Monitor Pest",
};

const urgencyColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  acknowledged: <AlertCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
};

export function RecommendationCard({
  recommendation,
  fieldName,
  onAcknowledge,
  onComplete,
  isLoading,
}: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 text-primary">{actionIcons[recommendation.action]}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{actionLabels[recommendation.action]}</h3>
              {fieldName && <p className="text-sm text-muted-foreground">{fieldName}</p>}
            </div>
          </div>
          <Badge className={`${urgencyColors[recommendation.urgency]} border-0`}>
            {recommendation.urgency.charAt(0).toUpperCase() + recommendation.urgency.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rationale */}
        <p className="text-sm text-foreground leading-relaxed">{recommendation.rationale}</p>

        {/* Metadata if available */}
        {recommendation.metadata && Object.keys(recommendation.metadata).length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {Object.entries(recommendation.metadata).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-muted-foreground">{key}:</span>
                <span className="ml-2 text-foreground">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status and timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            {statusIcons[recommendation.status]}
            <span className="capitalize">{recommendation.status}</span>
          </div>
          <span>{format(new Date(recommendation.createdAt), "MMM d, h:mm a")}</span>
        </div>

        {/* Actions */}
        {recommendation.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onAcknowledge}
              disabled={isLoading}
            >
              Acknowledge
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={onComplete}
              disabled={isLoading}
            >
              Mark Complete
            </Button>
          </div>
        )}
        {recommendation.status === "acknowledged" && (
          <Button
            size="sm"
            className="w-full"
            onClick={onComplete}
            disabled={isLoading}
          >
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
