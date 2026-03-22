import { useEffect, useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, Users, Search, X } from "lucide-react"
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

	// Search states
	const [searchParams, setSearchParams] = useSearchParams()
	const searchQuery = searchParams.get("s") || ""
	const [inputValue, setInputValue] = useState(searchQuery)
	const [suggestions, setSuggestions] = useState<UserWithReports[]>([])
	const [showAutocomplete, setShowAutocomplete] = useState(false)

	useEffect(() => {
		setLoading(true)
		api
			.get(`/api/users${searchQuery ? `?s=${encodeURIComponent(searchQuery)}` : ""}`)
			.then((res) => setUsers(res.data))
			.catch(() => setError("Failed to load users"))
			.finally(() => setLoading(false))
	}, [searchQuery])

	// Autocomplete Logic
	useEffect(() => {
		if (!inputValue || inputValue === searchQuery) {
			setSuggestions([])
			return
		}

		const timeoutId = setTimeout(() => {
			api
				.get(`/api/users?s=${encodeURIComponent(inputValue)}`)
				.then((res) => {
					setSuggestions(res.data)
				})
				.catch(() => {
					setSuggestions([])
				})
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [inputValue, searchQuery])

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
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

			<main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">User Reports</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Select a user to view their aggregated writing behaviour and session history.
						</p>
					</div>

					{/* Search Bar */}
					<div className="relative w-full sm:w-80">
						<div className="relative flex items-center">
							<input
								type="text"
								placeholder="Search users..."
								value={inputValue}
								onChange={(e) => {
									setInputValue(e.target.value)
									setShowAutocomplete(true)
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										if (inputValue) {
											setSearchParams({ s: inputValue })
										} else {
											setSearchParams({})
										}
										setShowAutocomplete(false)
									}
								}}
								onFocus={() => setShowAutocomplete(true)}
								onBlur={() => {
									setTimeout(() => setShowAutocomplete(false), 200)
								}}
								className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 pr-20"
							/>
							<div className="absolute right-1 flex items-center gap-1">
								{inputValue && (
									<Button
										variant="ghost"
										size="icon-sm"
										className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
										onClick={() => {
											setInputValue("")
											setSearchParams({})
											setSuggestions([])
										}}
									>
										<X className="size-4" />
									</Button>
								)}
								<Button
									variant="ghost"
									size="icon-sm"
									className="h-7 w-7 text-muted-foreground hover:text-foreground"
									onClick={() => {
										if (inputValue) {
											setSearchParams({ s: inputValue })
										} else {
											setSearchParams({})
										}
										setShowAutocomplete(false)
									}}
								>
									<Search className="size-4" />
								</Button>
							</div>
						</div>

						{/* Autocomplete Dropdown */}
						{showAutocomplete && suggestions.length > 0 && (
							<div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95">
								<ul className="max-h-60 overflow-auto py-1">
									{suggestions.map((suggestion) => (
										<li
											key={`auto-${suggestion._id}`}
											className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
											onClick={() => {
												setInputValue(suggestion.fullName || suggestion.email)
												setSuggestions([])
											}}
										>
											<div className="flex flex-col">
												<span className="font-medium">{suggestion.fullName || suggestion.email}</span>
												{suggestion.fullName && <span className="text-xs text-muted-foreground">{suggestion.email}</span>}
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				{loading && (
					<div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
						<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
						<p className="text-sm text-muted-foreground">Loading active writers...</p>
					</div>
				)}
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
					<div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
						{users.map((u) => (
							<Card key={u._id} className="shadow-sm transition-shadow hover:shadow-md flex flex-col">
								<CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
									<CardTitle className="truncate text-base">{u.fullName || u.email}</CardTitle>
									<CardDescription className="truncate text-xs">
										{u.fullName && <span>{u.email} • </span>}
										Joined {new Date(u.createdAt).toLocaleDateString()}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-1 flex flex-col justify-between space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
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
