import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { api } from "@/services/api"
import NotFound from "@/pages/NotFound"

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
	userId: string
	userEmail: string
	userFullName: string
	sessionId: string
	sessionTitle: string
	isDeleted?: boolean
	reportData: ReportData
	createdAt: string
}

function MetricRow({ label, value, badge }: { label: string; value: string | number; badge?: string }) {
	return (
		<div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
			<span className="text-sm text-muted-foreground">{label}</span>
			<div className="flex items-center gap-2">
				{badge && <Badge variant="secondary">{badge}</Badge>}
				<span className="text-sm font-semibold tabular-nums">{value}</span>
			</div>
		</div>
	)
}

export default function ReportDetails() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const location = useLocation()
	const [report, setReport] = useState<Report | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const sessionLabel =
		(location.state as { sessionLabel?: string } | null)?.sessionLabel || "Session"

	useEffect(() => {
		if (!id) return
		api
			.get(`/api/reports/${id}`)
			.then((res) => setReport(res.data))
			.catch(() => setError("Report not found."))
			.finally(() => setLoading(false))
	}, [id])

	if (loading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background animate-fade-in-up">
				<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
				<p className="text-sm text-muted-foreground tracking-tight">Loading session details...</p>
			</div>
		)
	}

	if (error || !report) {
		return <NotFound onGoHome={() => navigate(-1)} />
	}
	
	const { reportData } = report

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
					<Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
						<ArrowLeft className="size-4" />
					</Button>
					<div className="h-5 w-px bg-border" />
					<div className="flex items-center gap-2">
						<h1 className={`text-base font-semibold tracking-tight ${report.isDeleted ? 'line-through text-muted-foreground' : ''}`}>
							{sessionLabel}
						</h1>
						{report.isDeleted && (
							<span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded">
								Deleted
							</span>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl space-y-6 px-6 py-10 animate-fade-in">

				{/* Session Information */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Session Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0">
						<MetricRow label="Session" value={sessionLabel} />
						<MetricRow label="User Name" value={report.userFullName || "Writer"} />
						<MetricRow label="User Email" value={report.userEmail} />
						<MetricRow label="Session ID" value={report.sessionId} />
						<MetricRow label="Generated At" value={new Date(report.createdAt).toLocaleString()} />
					</CardContent>
				</Card>

				<Separator />

				{/* Writing Statistics */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Writing Statistics</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0">
						<MetricRow label="Word Count" value={reportData.wordCount.toLocaleString()} />
						<MetricRow label="Character Count" value={reportData.characterCount.toLocaleString()} />
					</CardContent>
				</Card>

				{/* Typing Behaviour */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Typing Behaviour</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0">
						<MetricRow label="Total Keystrokes" value={reportData.keystrokeCount.toLocaleString()} />
						<MetricRow
							label="Average Keystroke Interval"
							value={`${reportData.averageKeystrokeInterval} ms`}
							badge={reportData.averageKeystrokeInterval < 150 ? "Fast" : reportData.averageKeystrokeInterval < 350 ? "Normal" : "Slow"}
						/>
						<MetricRow label="Delete / Backspace Count" value={reportData.deleteCount.toLocaleString()} />
					</CardContent>
				</Card>

				{/* Pause Events */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Pause Events</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0">
						<MetricRow
							label="Pauses Detected"
							value={reportData.pauseCount}
							badge={reportData.pauseCount === 0 ? "None" : reportData.pauseCount < 5 ? "Few" : "Many"}
						/>
					</CardContent>
				</Card>

				{/* Paste Events */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Paste Events</CardTitle>
					</CardHeader>
					<CardContent className="space-y-0">
						<MetricRow label="Paste Count" value={reportData.pasteCount} />
						<MetricRow label="Total Pasted Characters" value={reportData.totalPastedCharacters.toLocaleString()} />
					</CardContent>
				</Card>

			</main>
		</div>
	)
}
