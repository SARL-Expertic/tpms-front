import MainLayout from "@/app/layouts/ClientLayout";
import Sidebar from "@/app/layouts/SideBar/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
   <MainLayout>
      <main>{children}</main>
    </MainLayout>
  );
}
