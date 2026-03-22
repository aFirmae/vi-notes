import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, User, BarChart2 } from "lucide-react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { api } from "@/services/api"

// --- Types ---
interface AggregateData {
	sessionCount: number
	totalWordCount: number
	totalCharCount: number
	totalKeystrokes: number
	avgKeystrokeInterval: number
	totalPauses: number
	totalPastes: number
	totalPastedChars: number
	totalDeletes: number
}

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

interface SessionReport {
	_id: string
	sessionId: string
	sessionTitle: string
	reportData: ReportData
	isDeleted: boolean
	createdAt: string
}

interface UserReportPayload {
	user: { _id: string; fullName: string; email: string; createdAt: string }
	reports: SessionReport[]
	aggregate: AggregateData | null
}

// --- Components ---
function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
	return (
		<div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border border-border/50">
			<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
			<span className="text-2xl font-bold">{value}</span>
			{sub && <span className="text-xs text-muted-foreground">{sub}</span>}
		</div>
	)
}

const renderCustomDot = (props: any) => {
	const { cx, cy, payload } = props;
	const fill = payload.isDeleted ? "#ef4444" : "#22c55e";
	return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} stroke={fill} fill={fill} className="transition-all duration-300 hover:r-6" />
}

export default function UserReportPage() {
	const { userId } = useParams<{ userId: string }>()
	const navigate = useNavigate()
	const [data, setData] = useState<UserReportPayload | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!userId) return
		api
			.get(`/api/users/${userId}/report`)
			.then((res) => setData(res.data))
			.catch(() => setError("Failed to load user aggregate data."))
			.finally(() => setLoading(false))
	}, [userId])

	if (loading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background animate-fade-in-up">
				<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
				<p className="text-sm text-muted-foreground tracking-tight">Loading behavior aggregate...</p>
			</div>
		)
	}
	if (error || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-center">
				<div>
					<p className="text-muted-foreground">{error ?? "User not found."}</p>
					<Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
				</div>
			</div>
		)
	}

	const { user, reports, aggregate } = data

	// Chart Data
	const chartData = [...reports].reverse().map((r, i) => ({
		name: r.sessionTitle || `Session ${i + 1}`,
		words: r.reportData.wordCount,
		speedMs: r.reportData.averageKeystrokeInterval,
		pastes: r.reportData.pasteCount,
		deletes: r.reportData.deleteCount,
		pauses: r.reportData.pauseCount,
		isDeleted: r.isDeleted,
	}))

	const chartConfig = {
		deletes: { label: "Deletes / Backspaces", color: "var(--color-chart-1)" },
		speedMs: { label: "Average Interval (ms)", color: "var(--color-chart-2)" },
		pastes: { label: "Paste Count", color: "var(--color-chart-3)" }
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
					<Button variant="ghost" size="icon-sm" onClick={() => navigate("/dashboard")} className="shrink-0">
						<ArrowLeft className="size-4" />
					</Button>
					<div className="h-5 w-px bg-border shrink-0" />
					<div className="flex flex-1 items-center gap-2 min-w-0">
						<User className="size-4 text-muted-foreground shrink-0" />
						<span className="text-base font-semibold tracking-tight truncate">{user.fullName || user.email}</span>
						{user.fullName && <span className="text-sm text-muted-foreground truncate hidden sm:inline-block">({user.email})</span>}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl space-y-6 sm:space-y-8 px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Aggregate Behaviour Report</h1>
						<p className="mt-1 text-sm text-muted-foreground">Over {aggregate?.sessionCount || 0} tracked sessions</p>
					</div>
					<BarChart2 className="size-8 text-primary/20" />
				</div>

				{aggregate ? (
					<>
						{/* Aggregate Stats */}
						<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
							<StatBox label="Total Words" value={aggregate.totalWordCount.toLocaleString()} />
							<StatBox label="Total Keystrokes" value={aggregate.totalKeystrokes.toLocaleString()} />
							<StatBox label="Avg Speed" value={`${aggregate.avgKeystrokeInterval}ms`} sub="Interval between keys" />
							<StatBox label="Delete / Backspace" value={aggregate.totalDeletes.toLocaleString()} />
							<StatBox label="Total Pauses" value={aggregate.totalPauses.toLocaleString()} sub="Gaps > 2 seconds" />
							<StatBox label="Paste Events" value={aggregate.totalPastes.toLocaleString()} />
							<StatBox label="Pasted Characters" value={aggregate.totalPastedChars.toLocaleString()} />
							<StatBox label="Avg Words / Session" value={Math.round(aggregate.totalWordCount / aggregate.sessionCount).toLocaleString()} />
						</div>

						{/* Charts */}
						<div className="grid gap-6 md:grid-cols-2">
							{/* Editing Behaviour Trend */}
							<Card className="shadow-sm">
								<CardHeader>
									<CardTitle className="text-base">Editing Behaviour Trend</CardTitle>
									<CardDescription>Frequency of deletes/backspaces per session</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer config={chartConfig} className="min-h-[250px] w-full">
										<AreaChart data={chartData} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
											<CartesianGrid vertical={false} strokeDasharray="3 3" />
											<XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(val) => val.slice(0, 8)} />
											<YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
											<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
											<Area type="monotone" dataKey="deletes" stroke="var(--color-deletes)" fillOpacity={0.2} fill="var(--color-deletes)" dot={renderCustomDot} activeDot={{ r: 6, fill: "#000000", stroke: "#000000" }} />
										</AreaChart>
									</ChartContainer>
								</CardContent>
							</Card>

							{/* Typing Speed Trend */}
							<Card className="shadow-sm">
								<CardHeader>
									<CardTitle className="text-base">Keystroke Interval Trend</CardTitle>
									<CardDescription>Lower interval (ms) = faster typing</CardDescription>
								</CardHeader>
								<CardContent>
									<ChartContainer config={chartConfig} className="min-h-[250px] w-full">
										<LineChart data={chartData} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
											<CartesianGrid vertical={false} strokeDasharray="3 3" />
											<XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(val) => val.slice(0, 8)} />
											<YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
											<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
											<Line type="monotone" dataKey="speedMs" stroke="var(--color-speedMs)" strokeWidth={2} dot={renderCustomDot} activeDot={{ r: 6, fill: "#000000", stroke: "#000000" }} />
										</LineChart>
									</ChartContainer>
								</CardContent>
							</Card>
						</div>

						{/* Individual Sessions */}
						<div className="pt-4 space-y-3">
							<h3 className="text-lg font-semibold tracking-tight mb-4">Individual Session Reports</h3>
							{reports.map((report) => (
								<Card key={report._id} className={`shadow-sm ${report.isDeleted ? 'opacity-60 bg-muted/30' : ''}`}>
									<div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
										<div>
											<div className="flex items-center gap-2">
												<h4 className={`font-semibold text-base ${report.isDeleted ? 'line-through text-muted-foreground' : ''}`}>
													{report.sessionTitle || "Untitled"}
												</h4>
												{report.isDeleted && (
													<span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded">
														Deleted
													</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												{new Date(report.createdAt).toLocaleString()} · {report.reportData.wordCount.toLocaleString()} words · {report.reportData.keystrokeCount.toLocaleString()} keystrokes
											</p>
										</div>
										<Button asChild size="sm" variant="outline" className="shrink-0">
											<Link to={`/report/${report._id}`}>View Details</Link>
										</Button>
									</div>
								</Card>
							))}
						</div>
					</>
				) : (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
							<BarChart2 className="size-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold">No tracked data</h3>
						<p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
							No tracked sessions available for this user yet.
						</p>
					</div>
				)}
			</main>
		</div>
	)
}
