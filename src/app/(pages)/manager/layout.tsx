import MainLayout from "@/app/layouts/ClientLayout";
import Sidebar from "@/app/layouts/SideBar/Sidebar";
import ZoomWrapper from "@/components/zoomwraper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ZoomWrapper>
      <MainLayout>
        <main>{children}</main>
      </MainLayout>
    </ZoomWrapper>
  );
}
