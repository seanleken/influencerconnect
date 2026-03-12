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
      <div className="hidden lg:block">
        <Sidebar user={user} unreadCount={unreadCount} />
      </div>
      <MobileNav user={user} unreadCount={unreadCount} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
