import { Link, useNavigate, useLocation } from "react-router-dom"
import {
	Plus,
	FileText,
	PenLine,
	ArrowRight,
	LogOut,
	Flame,
	LetterText,
	Notebook,
	Trash2,
	Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useSession } from "@/context/SessionContext"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, logout } = useAuth()
	const { sessions, addSession, deleteSession, isLoading } = useSession()

	const isNewUser = (location.state as { fromRegister?: boolean })?.fromRegister === true

	// ——— Computed stats ———
	const totalSessions = sessions.length
	const totalWords = sessions.reduce((sum, s) => {
		const wc = s.content.trim() ? s.content.trim().split(/\s+/).length : 0
		return sum + wc
	}, 0)
	const totalChars = sessions.reduce((sum, s) => sum + s.content.length, 0)

	const stats = [
		{ label: totalSessions === 1 ? "Session" : "Sessions", value: totalSessions.toLocaleString(), icon: FileText },
		{ label: totalWords === 1 ? "Word Written" : "Words Written", value: totalWords.toLocaleString(), icon: LetterText },
		{ label: totalChars === 1 ? "Character" : "Characters", value: totalChars.toLocaleString(), icon: Flame },
	]

	const handleNewSession = async () => {
		const id = await addSession()
		if (id) {
			navigate(`/editor/${id}`)
		}
	}

	// ——— Format relative time ———
	const formatTime = (iso: string) => {
		const d = new Date(iso)
		const now = new Date()
		const diffMs = now.getTime() - d.getTime()
		const diffMins = Math.floor(diffMs / 60_000)
		if (diffMins < 1) return "Just now"
		if (diffMins < 60) return `${diffMins}m ago`
		const diffHrs = Math.floor(diffMins / 60)
		if (diffHrs < 24) return `${diffHrs}h ago`
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: now.getFullYear() !== d.getFullYear() ? "numeric" : undefined,
		})
	}

	const formatUsername = (email?: string) => {
		if (!email) return "Writer"
		const name = email.split("@")[0].replace(/[0-9]/g, "")
		if (!name) return "Writer"
		return name.charAt(0).toUpperCase() + name.slice(1)
	}

	return (
		<div className="min-h-screen bg-background">
			{/* ——— Top nav ——— */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
					<div className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
							<PenLine className="size-4.5 text-primary-foreground" />
						</div>
						<span className="text-base font-semibold tracking-tight">
							Vi-Notes
						</span>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate("/users")}
							className="hidden sm:flex"
						>
							<Users className="size-4 mr-2" />
							Active Writers
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => logout()}
							className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						>
							<LogOut className="size-4 mr-2" />
							Sign Out
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
				{/* ——— Greeting ——— */}
				<section className="mb-10">
					<h1 className="text-3xl font-bold tracking-tight">
						{isNewUser ? "Welcome to Vi-Notes! 🎉" : `Welcome back, ${formatUsername(user?.email)}`}
					</h1>
					<p className="mt-1.5 text-muted-foreground">
						{isNewUser
							? "Create your first writing session to get started."
							: totalSessions > 0
								? "Pick up where you left off or start something new."
								: "Create your first writing session to get started."}
					</p>
				</section>

				{/* ——— Stats ——— */}
				<section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{stats.map((s) => (
						<Card
							key={s.label}
							className="shadow-sm transition-shadow hover:shadow-md"
						>
							<CardContent className="flex items-center gap-4 py-5">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
									<s.icon className="size-5 text-foreground/70" />
								</div>
								<div>
									<p className="text-2xl font-bold leading-none tracking-tight">
										{s.value}
									</p>
									<p className="mt-1 text-xs font-medium text-muted-foreground">
										{s.label}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</section>

				{/* ——— Sessions header ——— */}
				<section>
					<div className="mb-5 flex items-center justify-between">
						<h2 className="text-xl font-semibold tracking-tight">
							Your Writing Sessions
						</h2>
						<Button onClick={handleNewSession}>
							<Plus className="size-4" />
							New Session
						</Button>
					</div>

					{/* ——— Empty state ——— */}
					{isLoading ? (
						<Card className="shadow-sm">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
								<p className="mt-4 text-sm text-muted-foreground">Loading sessions...</p>
							</CardContent>
						</Card>
					) : sessions.length === 0 ? (
						<Card className="shadow-sm">
							<CardContent className="flex flex-col items-center justify-center py-16 text-center">
								<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
									<Notebook className="size-8 text-muted-foreground" />
								</div>
								<h3 className="text-lg font-semibold tracking-tight">
									No sessions yet
								</h3>
								<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
									Start your first writing session. Your thoughts
									deserve a place to live.
								</p>
								<Button
									size="lg"
									className="mt-6"
									onClick={handleNewSession}
								>
									<Plus className="size-4" />
									Start Writing
								</Button>
							</CardContent>
						</Card>
					) : (
						/* ——— Session list ——— */
						<div className="space-y-3">
							{[...sessions]
								.sort(
									(a, b) =>
										new Date(b.updatedAt).getTime() -
										new Date(a.updatedAt).getTime()
								)
								.map((session) => {
									const wc = session.content.trim()
										? session.content.trim().split(/\s+/).length
										: 0
									return (
										<Link
											key={session._id}
											to={`/editor/${session._id}`}
											className="group block"
										>
											<Card className="shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative">
												<Button
													variant="ghost"
													size="icon-sm"
													className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
													onClick={(e) => {
														e.preventDefault()
														e.stopPropagation()
														deleteSession(session._id)
													}}
												>
													<Trash2 className="size-4" />
												</Button>
												<CardHeader className="flex-row items-center justify-between gap-4">
													<div className="flex items-center gap-4 min-w-0">
														<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
															<FileText className="size-4.5 text-foreground/60" />
														</div>
														<div className="min-w-0">
															<CardTitle className="truncate text-base font-semibold">
																{session.title || "Untitled"}
															</CardTitle>
															<CardDescription className="mt-0.5 text-xs">
																{wc.toLocaleString()} word{wc !== 1 ? "s" : ""} · {formatTime(session.updatedAt)}
															</CardDescription>
														</div>
													</div>
													<ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground/60" />
												</CardHeader>
											</Card>
										</Link>
									)
								})}
						</div>
					)}
				</section>
			</main>
		</div>
	)
}