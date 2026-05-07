import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/TaskCard";
import { ImageUploadCard } from "@/components/ImageUploadCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function WorkerApp() {
  const { user, logout } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  // Fetch worker assignments
  const { data: assignments } = trpc.assignment.listByWorker.useQuery(
    { workerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Set default farm from assignments
  useEffect(() => {
    if (assignments && assignments.length > 0 && !selectedFarmId) {
      setSelectedFarmId(assignments[0].farmId);
      if (assignments[0].fieldId) {
        setSelectedFieldId(assignments[0].fieldId);
      }
    }
  }, [assignments, selectedFarmId]);

  // Fetch tasks for worker
  const { data: tasks, refetch: refetchTasks } = trpc.task.listByWorker.useQuery(
    { workerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Fetch fields
  const { data: fields } = trpc.field.listByFarm.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  // Fetch recommendations for field
  const { data: recommendations } = trpc.recommendation.listByField.useQuery(
    { fieldId: selectedFieldId },
    { enabled: !!selectedFieldId }
  );

  // Fetch field uploads
  const { data: uploads } = trpc.upload.listByField.useQuery(
    { fieldId: selectedFieldId },
    { enabled: !!selectedFieldId }
  );

  // Mutations
  const updateTaskStatus = trpc.task.updateStatus.useMutation({
    onSuccess: () => {
      refetchTasks();
      toast.success("Task updated");
    },
  });

  const addTaskNotes = trpc.task.addNotes.useMutation({
    onSuccess: () => {
      refetchTasks();
      toast.success("Notes added");
    },
  });

  const createUpload = trpc.upload.create.useMutation({
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
  });

  const handleImageUpload = async (file: File, imageType: string, notes: string) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const imageUrl = reader.result as string;
        const storageKey = `field-uploads/${selectedFieldId}/${Date.now()}-${file.name}`;

        await createUpload.mutateAsync({
          farmId: selectedFarmId,
          fieldId: selectedFieldId,
          workerId: user?.id || 0,
          imageUrl,
          imageType: (imageType as "soil" | "crop" | "pest" | "irrigation" | "general") || "general",
          storageKey,
          notes: notes || undefined,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    await updateTaskStatus.mutateAsync({ taskId, status: status as "pending" | "in_progress" | "completed" | "overdue" });
  };

  if (!user) return null;

  const assignedFarms = assignments?.map((a) => a.farmId) || [];
  const filteredTasks = tasks?.filter((t) => t.farmId === selectedFarmId) || [];
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  // Calculate stats
  const stats = {
    pending: pendingTasks.length,
    inProgress: inProgressTasks.length,
    completed: completedTasks.length,
    total: filteredTasks.length,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Tasks</h1>
              <p className="text-sm text-muted-foreground">{user.name || user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-4 space-y-6">
        {/* Farm Selection */}
        {assignedFarms.length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Select Farm</label>
            <select
              value={selectedFarmId}
              onChange={(e) => {
                setSelectedFarmId(e.target.value);
                setSelectedFieldId("");
              }}
              className="w-full px-3 py-2 border rounded-lg bg-background text-base"
            >
              {assignedFarms.map((farmId) => (
                <option key={farmId} value={farmId}>
                  Farm {farmId.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Field Selection */}
        {fields && fields.length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Select Field</label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background text-base"
            >
              {fields?.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name || `Field ${field.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Task Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                <p className="text-xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <p className="text-xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Camera className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <p className="text-xl font-bold">{uploads?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="recommendations">Advice</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                  <p className="text-muted-foreground">All tasks completed!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                      Pending Tasks
                    </h3>
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task as any}
                          fieldName={fields?.find((f) => f.id === task.fieldId)?.name}
                          onStatusChange={(status) =>
                            handleTaskStatusChange(task.id, status)
                          }
                          isLoading={updateTaskStatus.isPending}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* In Progress Tasks */}
                {inProgressTasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                      In Progress
                    </h3>
                    <div className="space-y-3">
                      {inProgressTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task as any}
                          fieldName={fields?.find((f) => f.id === task.fieldId)?.name}
                          onStatusChange={(status) =>
                            handleTaskStatusChange(task.id, status)
                          }
                          isLoading={updateTaskStatus.isPending}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                      Completed
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task as any}
                          fieldName={fields?.find((f) => f.id === task.fieldId)?.name}
                          isLoading={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {!recommendations || recommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No recommendations for this field</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec as any}
                    isLoading={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <ImageUploadCard
              onUpload={handleImageUpload}
              isLoading={createUpload.isPending}
            />

            {uploads && uploads.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Recent Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="rounded-lg overflow-hidden border">
                      <img
                        src={upload.imageUrl}
                        alt={upload.imageType || "field observation"}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 bg-card">
                        <p className="text-xs font-medium capitalize">
                          {upload.imageType || "general"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
