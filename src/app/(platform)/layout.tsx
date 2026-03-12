import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/services/notification.service";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  const user = {
    id: session.user.id,
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image,
    role: session.user.role,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} unreadCount={unreadCount} />
      </div>

      {/* Mobile nav */}
      <MobileNav user={user} unreadCount={unreadCount} />

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
