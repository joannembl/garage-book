import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getCurrentUser } from '@/app/actions/auth'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
