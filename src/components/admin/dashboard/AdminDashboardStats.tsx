
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/contexts/AdminContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { File, Users, PlayCircle, Film, Tv } from "lucide-react";

// Mock data for demonstration
const viewsData = [
  { name: "Mon", views: 2400 },
  { name: "Tue", views: 1398 },
  { name: "Wed", views: 9800 },
  { name: "Thu", views: 3908 },
  { name: "Fri", views: 4800 },
  { name: "Sat", views: 3800 },
  { name: "Sun", views: 4300 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendDirection = "neutral",
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div
            className={`mt-1 text-xs ${
              trendDirection === "up"
                ? "text-green-500"
                : trendDirection === "down"
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "•"}{" "}
            {trend}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboardStats = () => {
  const { settings } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="2,350"
          description="Active users this month"
          trend={5.2}
          trendDirection="up"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Content Views"
          value="14,280"
          description="Total views this week"
          trend={2.1}
          trendDirection="up"
          icon={<PlayCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Movies"
          value="830"
          description="Available in library"
          icon={<Film className="h-4 w-4" />}
        />
        <StatCard
          title="TV Shows"
          value="267"
          description="Available in library"
          trend={1.3}
          trendDirection="down"
          icon={<Tv className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Views</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke={settings.primaryColor || "#8884d8"}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`mr-2 rounded-full p-1 ${i % 2 === 0 ? "bg-blue-100" : "bg-green-100"}`}>
                    <File className={`h-3 w-3 ${i % 2 === 0 ? "text-blue-600" : "text-green-600"}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {i % 2 === 0 ? "Movie added" : "TV Show updated"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Date.now() - i * 3600000).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardStats;
