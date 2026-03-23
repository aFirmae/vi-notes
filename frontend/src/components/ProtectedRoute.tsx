import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4 animate-fade-in-up">
					<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
					<p className="text-sm text-muted-foreground tracking-tight">Authenticating...</p>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}
