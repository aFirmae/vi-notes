import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { api } from "@/services/api"

interface ReportData {
	wordCount: number
	characterCount: number
	keystrokeCount: number
	averageKeystrokeInterval: number
	pauseCount: number
	pasteCount: number
	totalPastedCharacters: number
	deleteCount: number
}

interface Report {
	_id: string
	userEmail: string
	sessionTitle: string
	reportData: ReportData
	createdAt: string
}

function StatItem({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex justify-between items-baseline py-1.5 border-b border-border/50 last:border-0">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-sm font-semibold tabular-nums">{value}</span>
		</div>
	)
}

export default function Reports() {
	const navigate = useNavigate()
	const [reports, setReports] = useState<Report[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		api
			.get("/api/reports")
			.then((res) => setReports(res.data))
			.catch(() => setError("Failed to load reports"))
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
						<ClipboardList className="size-4 text-muted-foreground" />
						<span className="text-base font-semibold tracking-tight">Writing Reports</span>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
				{loading && (
					<p className="text-center text-muted-foreground">Loading reports...</p>
				)}
				{error && (
					<p className="text-center text-destructive">{error}</p>
				)}
				{!loading && !error && reports.length === 0 && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
							<ClipboardList className="size-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold">No reports yet</h3>
						<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
							Open a session in the Editor and click "Generate Report" to create your first report.
						</p>
						<Button className="mt-6" onClick={() => navigate("/dashboard")}>
							Go to Dashboard
						</Button>
					</div>
				)}

				{!loading && reports.length > 0 && (
					<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{reports.map((report) => (
							<Card key={report._id} className="shadow-sm transition-shadow hover:shadow-md flex flex-col">
								<CardHeader className="pb-2">
									<CardTitle className="truncate text-base">
										{report.sessionTitle || "Untitled"}
									</CardTitle>
									<CardDescription className="truncate text-xs">
										{report.userEmail}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-1 space-y-0.5">
									<StatItem label="Word Count" value={report.reportData.wordCount.toLocaleString()} />
									<StatItem label="Characters" value={report.reportData.characterCount.toLocaleString()} />
									<StatItem label="Keystrokes" value={report.reportData.keystrokeCount.toLocaleString()} />
									<StatItem label="Avg. Interval" value={`${report.reportData.averageKeystrokeInterval} ms`} />
									<StatItem label="Pauses" value={report.reportData.pauseCount} />
									<StatItem label="Pastes" value={report.reportData.pasteCount} />
									<StatItem label="Pasted Chars" value={report.reportData.totalPastedCharacters.toLocaleString()} />
									<StatItem label="Deletes" value={report.reportData.deleteCount.toLocaleString()} />
									<p className="pt-2 text-xs text-muted-foreground">
										{new Date(report.createdAt).toLocaleString()}
									</p>
								</CardContent>
								<div className="px-6 pb-5">
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link to={`/report/${report._id}`}>View Details</Link>
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
