import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { api } from "@/services/api"

interface UserWithReports {
	_id: string
	fullName: string
	email: string
	createdAt: string
	sessionCount: number
}

export default function UsersPage() {
	const navigate = useNavigate()
	const [users, setUsers] = useState<UserWithReports[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.get("/api/users")
			.then((res) => setUsers(res.data))
			.catch(() => setError("Failed to load users"))
			.finally(() => setLoading(false))
	}, [])

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-6">
					<Button variant="ghost" size="icon-sm" onClick={() => navigate("/dashboard")}>
						<ArrowLeft className="size-4" />
					</Button>
					<div className="h-5 w-px bg-border" />
					<div className="flex items-center gap-2">
						<Users className="size-4 text-muted-foreground" />
						<span className="text-base font-semibold tracking-tight">Active Writers</span>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
				<div className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight">User Reports</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Select a user to view their aggregated writing behaviour and session history.
					</p>
				</div>

				{loading && <p className="text-center text-muted-foreground">Loading users...</p>}
				{error && <p className="text-center text-destructive">{error}</p>}
				{!loading && !error && users.length === 0 && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
							<Users className="size-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold">No active users found</h3>
						<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
							Users will appear here once they generate their first session report.
						</p>
					</div>
				)}

				{!loading && users.length > 0 && (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{users.map((u) => (
							<Card key={u._id} className="shadow-sm transition-shadow hover:shadow-md flex flex-col">
								<CardHeader className="pb-4">
									<CardTitle className="truncate text-base">{u.fullName || u.email}</CardTitle>
									<CardDescription className="truncate text-xs">
										{u.fullName && <span>{u.email} • </span>}
										Joined {new Date(u.createdAt).toLocaleDateString()}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-between space-y-4">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Tracked Sessions</span>
										<span className="font-semibold">{u.sessionCount}</span>
									</div>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link to={`/users/${u._id}`}>View Aggregate Report</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
