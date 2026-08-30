import UserDashboard from "@/components/dashboard/UserDashboard";

export const metadata = {
  title: "ផ្ទាំងព័ត៌មាន | FoodHub",
  description: "គ្រប់គ្រងប្រវត្តិរូប និងការកំណត់ចំណូលចិត្តរបស់អ្នកនៅលើ FoodHub។",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <UserDashboard />
    </main>
  );
}
// Rendered inside DashboardLayout (src/app/dashboard/layout.tsx), which adds the Aside sidebar.