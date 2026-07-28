import UserDashboard from "@/components/dashboard/UserDashboard";

export const metadata = {
  title: "ផ្ទាំងព័ត៌មាន | FoodHub",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <UserDashboard />
    </main>
  );
}
// Rendered inside DashboardLayout (src/app/dashboard/layout.tsx), which adds the Aside sidebar.