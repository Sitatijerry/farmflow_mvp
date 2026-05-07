import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendationCard } from "@/components/RecommendationCard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CropStatusPanel } from "@/components/CropStatusPanel";
import { FieldMap } from "@/components/FieldMap";
import {
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Leaf,
  RefreshCw,
} from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");

  // Fetch farms
  const { data: farms, isLoading: farmsLoading } = trpc.farm.list.useQuery();

  // Set default farm
  useEffect(() => {
    if (farms && farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch fields for selected farm
  const { data: fields, isLoading: fieldsLoading } = trpc.field.listByFarm.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  // Set default field
  useEffect(() => {
    if (fields && fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  // Fetch recommendations
  const { data: recommendations, isLoading: recsLoading } =
    trpc.recommendation.listByFarm.useQuery(
      { farmId: selectedFarmId },
      { enabled: !!selectedFarmId }
    );

  // Fetch weather
  const { data: weather, isLoading: weatherLoading } = trpc.weather.getLatestByFarm.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  // Fetch tasks
  const { data: tasks } = trpc.task.listByFarm.useQuery(
    { farmId: selectedFarmId },
    { enabled: !!selectedFarmId }
  );

  const updateRecommendationStatus = trpc.recommendation.updateStatus.useMutation();

  const handleAcknowledgeRec = async (recId: string) => {
    await updateRecommendationStatus.mutateAsync({
      recId,
      status: "acknowledged",
    });
  };

  const handleCompleteRec = async (recId: string) => {
    await updateRecommendationStatus.mutateAsync({
      recId,
      status: "completed",
    });
  };

  const currentFarm = farms?.find((f) => f.id === selectedFarmId);
  const currentField = fields?.find((f) => f.id === selectedFieldId);
  const fieldRecommendations = recommendations?.filter((r) => r.fieldId === selectedFieldId) || [];
  const fieldTasks = tasks?.filter((t) => t.fieldId === selectedFieldId) || [];

  // Type conversion helpers
  const convertFieldData = (f: any): any => ({
    ...f,
    area: f.area ? Number(f.area) : 0,
    waterStressIndex: f.waterStressIndex ? Number(f.waterStressIndex) : 0,
    soilMoisture: f.soilMoisture ? Number(f.soilMoisture) : 0,
    temperature: f.temperature ? Number(f.temperature) : 0,
    latitude: f.latitude ? Number(f.latitude) : 0,
    longitude: f.longitude ? Number(f.longitude) : 0,
  });

  const convertWeatherData = (w: any): any => ({
    ...w,
    temperature: w?.temperature ? Number(w.temperature) : 0,
    humidity: w?.humidity ? Number(w.humidity) : 0,
    rainfall: w?.rainfall ? Number(w.rainfall) : 0,
    windSpeed: w?.windSpeed ? Number(w.windSpeed) : 0,
  });

  // Calculate stats
  const stats = {
    totalFields: fields?.length || 0,
    activeRecommendations: recommendations?.filter((r) => r.status === "pending").length || 0,
    completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
    pendingTasks: tasks?.filter((t) => t.status === "pending").length || 0,
    overdueTasks: tasks?.filter((t) => t.status === "overdue").length || 0,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">FarmFlow Manager</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Farm & Field Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Farm</label>
            <select
              value={selectedFarmId}
              onChange={(e) => {
                setSelectedFarmId(e.target.value);
                setSelectedFieldId("");
              }}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {farms?.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Field</label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {fields?.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Leaf className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalFields}</p>
                <p className="text-xs text-muted-foreground">Fields</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{stats.activeRecommendations}</p>
                <p className="text-xs text-muted-foreground">Pending Recs</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">Pending Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{stats.overdueTasks}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather Widget */}
              <WeatherWidget
                current={convertWeatherData(weather)}
                loading={weatherLoading}
              />

              {/* Crop Status */}
              {currentField && <CropStatusPanel field={convertFieldData(currentField)} />}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {recsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading recommendations...</p>
              </div>
            ) : fieldRecommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No recommendations yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {fieldRecommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec as any}
                    fieldName={currentField?.name}
                    onAcknowledge={() => handleAcknowledgeRec(rec.id)}
                    onComplete={() => handleCompleteRec(rec.id)}
                    isLoading={updateRecommendationStatus.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {fieldTasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No tasks assigned</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {fieldTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize">{task.status}</span>
                        <span className="text-muted-foreground">
                          {task.dueAt
                            ? new Date(task.dueAt).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            {fields && (
              <FieldMap
                fields={fields as any}
                selectedFieldId={selectedFieldId}
                onFieldSelect={setSelectedFieldId}
                height="500px"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
