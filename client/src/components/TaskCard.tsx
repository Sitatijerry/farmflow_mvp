import { WorkerTaskData } from "@shared/types";
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
  MapPin,
} from "lucide-react";
import { format, differenceInHours } from "date-fns";

interface TaskCardProps {
  task: WorkerTaskData;
  fieldName?: string;
  onStatusChange?: (status: string) => void;
  onAddNotes?: () => void;
  isLoading?: boolean;
}

const taskTypeIcons: Record<string, React.ReactNode> = {
  irrigate: <Droplet className="w-5 h-5" />,
  fertilize: <Leaf className="w-5 h-5" />,
  scout: <Eye className="w-5 h-5" />,
  harvest: <Scissors className="w-5 h-5" />,
  weeding: <Leaf className="w-5 h-5" />,
  pesticide: <Bug className="w-5 h-5" />,
  other: <AlertCircle className="w-5 h-5" />,
};

const taskTypeLabels: Record<string, string> = {
  irrigate: "Irrigate",
  fertilize: "Fertilize",
  scout: "Scout",
  harvest: "Harvest",
  weeding: "Weeding",
  pesticide: "Pesticide",
  other: "Other",
};

const urgencyColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const statusColors: Record<string, string> = {
  pending: "border-l-gray-400",
  in_progress: "border-l-blue-500",
  completed: "border-l-green-500",
  overdue: "border-l-red-500",
};

export function TaskCard({
  task,
  fieldName,
  onStatusChange,
  onAddNotes,
  isLoading,
}: TaskCardProps) {
  const isOverdue =
    task.dueAt &&
    task.status !== "completed" &&
    new Date(task.dueAt) < new Date();

  const hoursUntilDue =
    task.dueAt && !isOverdue
      ? differenceInHours(new Date(task.dueAt), new Date())
      : null;

  return (
    <Card className={`overflow-hidden border-l-4 ${statusColors[task.status]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 text-primary">{taskTypeIcons[task.taskType]}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              {fieldName && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {fieldName}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${urgencyColors[task.urgency]} border-0`}>
            {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {task.description && (
          <p className="text-sm text-foreground leading-relaxed">{task.description}</p>
        )}

        {/* Due date and status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {task.dueAt ? (
              <div>
                <p className="font-medium">
                  {format(new Date(task.dueAt), "MMM d, h:mm a")}
                </p>
                {isOverdue && (
                  <p className="text-xs text-red-600 dark:text-red-400">Overdue</p>
                )}
                {hoursUntilDue !== null && hoursUntilDue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {hoursUntilDue}h remaining
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No due date</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium">
            {task.status === "pending" && (
              <>
                <Clock className="w-3 h-3" />
                Pending
              </>
            )}
            {task.status === "in_progress" && (
              <>
                <AlertCircle className="w-3 h-3" />
                In Progress
              </>
            )}
            {task.status === "completed" && (
              <>
                <CheckCircle className="w-3 h-3" />
                Completed
              </>
            )}
            {task.status === "overdue" && (
              <>
                <AlertCircle className="w-3 h-3" />
                Overdue
              </>
            )}
          </div>
        </div>

        {/* Notes if available */}
        {task.notes && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground">{task.notes}</p>
          </div>
        )}

        {/* Proof image if completed */}
        {task.proofImageUrl && (
          <div className="rounded-lg overflow-hidden border">
            <img
              src={task.proofImageUrl}
              alt="Task proof"
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Action buttons */}
        {task.status !== "completed" && (
          <div className="flex gap-2 pt-2">
            {task.status === "pending" && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onStatusChange?.("in_progress")}
                disabled={isLoading}
              >
                Start Task
              </Button>
            )}
            {task.status === "in_progress" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onAddNotes}
                  disabled={isLoading}
                >
                  Add Notes
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onStatusChange?.("completed")}
                  disabled={isLoading}
                >
                  Complete
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
