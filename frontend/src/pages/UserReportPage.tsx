import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, User, BarChart2, Check, Filter, X } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { api } from "@/services/api"
import NotFound from "@/pages/NotFound"

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
	reportData: ReportData
	isDeleted: boolean
	createdAt: string
}

interface UserReportPayload {
	user: { _id: string; fullName: string; email: string; createdAt: string }
	reports: SessionReport[]
	aggregate: AggregateData | null
}

type TrendKey =
	| "words"
	| "chars"
	| "pastedChars"
	| "keystrokes"
	| "speedMs"
	| "pastes"
	| "deletes"
	| "pauses"

interface TrendOption {
	key: TrendKey
	title: string
	description: string
	color: string
}

const localKey = "selectedTrends"

const trendOptions: TrendOption[] = [
	{
		key: "words",
		title: "Total Words Trend",
		description: "Number of words written per session",
		color: "#2563eb",
	},
	{
		key: "chars",
		title: "Total Characters Trend",
		description: "Number of characters typed per session",
		color: "#d1d5db",
	},
	{
		key: "pastedChars",
		title: "Pasted Characters Trend",
		description: "Number of characters pasted per session",
		color: "#7c3aed",
	},
	{
		key: "keystrokes",
		title: "Total Keystrokes Trend",
		description: "Frequency of keystrokes per session",
		color: "#f59e0b",
	},
	{
		key: "speedMs",
		title: "Typing Speed Trend",
		description: "Average milliseconds between keystrokes",
		color: "#14b8a6",
	},
	{
		key: "pastes",
		title: "Paste Events Trend",
		description: "Number of paste actions per session",
		color: "#ec4899",
	},
	{
		key: "deletes",
		title: "Editing Behaviour Trend",
		description: "Frequency of deletes/backspaces per session",
		color: "#f97316",
	},
	{
		key: "pauses",
		title: "Pause Behaviour Trend",
		description: "Count of pauses longer than 2 seconds",
		color: "#6366f1",
	},
]

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
	const fill = payload.isDeleted ? "#ef4444" : "#22c55e"
	return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} stroke={fill} fill={fill} className="transition-all duration-300 hover:r-4" />
}

export default function UserReportPage() {
	const { userId } = useParams<{ userId: string }>()
	const navigate = useNavigate()
	const [data, setData] = useState<UserReportPayload | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isTrendMenuOpen, setIsTrendMenuOpen] = useState(false)
	const [selectedTrendKeys, setSelectedTrendKeys] = useState<TrendKey[]>(() => {
		if (typeof window === "undefined") return []

		try {
			const savedSelection = window.localStorage.getItem(localKey)
			if (!savedSelection) return []

			const parsedSelection: unknown = JSON.parse(savedSelection)
			if (!Array.isArray(parsedSelection)) return []

			const validTrendKeys = new Set(trendOptions.map((trend) => trend.key))
			return parsedSelection.filter(
				(item): item is TrendKey =>
					typeof item === "string" && validTrendKeys.has(item as TrendKey),
			)
		} catch {
			return []
		}
	})
	const trendMenuRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!userId) return
		api
			.get(`/api/users/${userId}/report`)
			.then((res) => setData(res.data))
			.catch(() => setError("Failed to load user aggregate data."))
			.finally(() => setLoading(false))
	}, [userId])

	useEffect(() => {
		if (!isTrendMenuOpen) return

		const onClickOutside = (event: MouseEvent) => {
			if (!trendMenuRef.current) return
			if (!trendMenuRef.current.contains(event.target as Node)) {
				setIsTrendMenuOpen(false)
			}
		}

		document.addEventListener("mousedown", onClickOutside)
		return () => document.removeEventListener("mousedown", onClickOutside)
	}, [isTrendMenuOpen])

	useEffect(() => {
		if (typeof window === "undefined") return
		window.localStorage.setItem(
			localKey,
			JSON.stringify(selectedTrendKeys),
		)
	}, [selectedTrendKeys])

	if (loading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background animate-fade-in-up">
				<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
				<p className="text-sm text-muted-foreground tracking-tight">Loading behavior aggregate...</p>
			</div>
		)
	}

	if (error || !data) {
		return <NotFound homeHref="/users" />
	}

	const { user, reports, aggregate } = data
	const reportsBy = [...reports].sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	)
	const sessionLabels = new Map(
		reportsBy.map((report, index) => [report._id, `Session ${index + 1}`]),
	)

	// Chart Data
	const chartData = reportsBy.map((r, i) => ({
		name: `S${i + 1}`,
		sessionLabel: `Session ${i + 1}`,
		words: r.reportData.wordCount,
		chars: r.reportData.characterCount,
		pastedChars: r.reportData.totalPastedCharacters,
		keystrokes: r.reportData.keystrokeCount,
		speedMs: r.reportData.averageKeystrokeInterval,
		pastes: r.reportData.pasteCount,
		deletes: r.reportData.deleteCount,
		pauses: r.reportData.pauseCount,
		isDeleted: r.isDeleted,
	}))

	const chartConfig = trendOptions.reduce<Record<TrendKey, { label: string; color: string }>>(
		(acc, trend) => {
			acc[trend.key] = { label: trend.title, color: trend.color }
			return acc
		},
		{} as Record<TrendKey, { label: string; color: string }>,
	)

	const visibleTrends = trendOptions.filter((trend) => selectedTrendKeys.includes(trend.key))
	const presetTrendKeys: Record<"all" | "writing" | "behavior", TrendKey[]> = {
		all: trendOptions.map((trend) => trend.key),
		writing: ["words", "chars", "keystrokes", "deletes"],
		behavior: ["speedMs", "pauses", "pastes", "pastedChars"],
	}

	const doesSelectionMatch = (targetKeys: TrendKey[]) => {
		if (selectedTrendKeys.length !== targetKeys.length) return false
		return targetKeys.every((key) => selectedTrendKeys.includes(key))
	}

	const toggleTrend = (trendKey: TrendKey) => {
		setSelectedTrendKeys((previousSelection) => {
			if (previousSelection.includes(trendKey)) {
				return previousSelection.filter((key) => key !== trendKey)
			}

			return [...previousSelection, trendKey]
		})
	}

	const applyPreset = (preset: "all" | "writing" | "behavior") => {
		const nextPresetSelection = presetTrendKeys[preset]
		if (doesSelectionMatch(nextPresetSelection)) {
			setSelectedTrendKeys([])
			return
		}

		setSelectedTrendKeys(nextPresetSelection)
	}

	const tooltipContent = (
		<ChartTooltipContent
			labelFormatter={(_, payload) => {
				const label = payload?.[0]?.payload?.sessionLabel
				return typeof label === "string" ? label : "Session"
			}}
		/>
	)

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
				<div className="space-y-3">
					<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Aggregate Behaviour Report</h1>
						<p className="mt-1 text-sm text-muted-foreground">Over {aggregate?.sessionCount || 0} tracked sessions</p>
					</div>
						<div className="flex items-center gap-2">
						<div ref={trendMenuRef} className="relative">
							<Button
								variant="outline"
								onClick={() => setIsTrendMenuOpen((isOpen) => !isOpen)}
								className="h-10 rounded-xl border-dashed px-3"
							>
								<Filter className="size-4" />
								Trend Studio
								<span className="ml-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
									{selectedTrendKeys.length}
								</span>
							</Button>

							{isTrendMenuOpen && (
								<div className="absolute right-0 top-12 z-40 w-[min(38rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur">
									<div className="flex items-start justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
										<div>
											<h4 className="font-semibold tracking-tight">Choose Visible Trends</h4>
											<p className="mt-1 text-xs text-muted-foreground">
												Pick any number of trends to show full-width charts.
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon-xs"
											onClick={() => setIsTrendMenuOpen(false)}
										>
											<X className="size-4" />
										</Button>
									</div>

									<div className="space-y-4 p-4">
										<div className="flex flex-wrap gap-2">
											<Button
												variant={doesSelectionMatch(presetTrendKeys.all) ? "default" : "secondary"}
												size="xs"
												onClick={() => applyPreset("all")}
											>
												All Trends
											</Button>
											<Button
												variant={doesSelectionMatch(presetTrendKeys.writing) ? "default" : "secondary"}
												size="xs"
												onClick={() => applyPreset("writing")}
											>
												Writing Core
											</Button>
											<Button
												variant={doesSelectionMatch(presetTrendKeys.behavior) ? "default" : "secondary"}
												size="xs"
												onClick={() => applyPreset("behavior")}
											>
												Behaviour Focus
											</Button>
										</div>

										<div className="grid gap-2 sm:grid-cols-2">
											{trendOptions.map((trend) => {
												const isSelected = selectedTrendKeys.includes(trend.key)

												return (
													<button
														type="button"
														key={trend.key}
														onClick={() => toggleTrend(trend.key)}
														className={`flex items-center justify-between rounded-xl border p-3 text-left transition min-h-[88px] ${isSelected ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border/70 bg-muted/20 hover:border-primary/30"}`}
													>
														<div>
															<p className="text-sm font-medium leading-tight">{trend.title}</p>
															<p className="mt-1 text-xs text-muted-foreground leading-tight">{trend.description}</p>
														</div>
														<span
															className={`ml-3 inline-flex size-5 items-center justify-center rounded-md border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"}`}
														>
															<Check className="size-3" />
														</span>
													</button>
												)
											})}
										</div>
									</div>
								</div>
							)}
						</div>

						<BarChart2 className="size-8 text-primary/20 hidden lg:block" />
						</div>
					</div>
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
						<div className="space-y-6">
							{visibleTrends.map((trend) => (
								<Card key={trend.key} className="mx-auto w-full max-w-5xl shadow-sm">
									<CardHeader className="gap-3">
										<div className="flex items-start justify-between gap-3">
											<div>
												<CardTitle className="text-base">{trend.title}</CardTitle>
												<CardDescription>{trend.description}</CardDescription>
											</div>
											<div className="hidden min-[400px]:flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-[11px]">
												<div className="flex items-center gap-1.5">
													<span className="inline-block size-2 rounded-full bg-[#22c55e]" />
													<span className="text-muted-foreground">Active</span>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="inline-block size-2 rounded-full bg-[#ef4444]" />
													<span className="text-muted-foreground">Deleted</span>
												</div>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<ChartContainer config={chartConfig} className="min-h-[180px] w-full">
											<LineChart data={chartData} margin={{ top: 20, left: -20, right: 10, bottom: 0 }}>
												<CartesianGrid vertical={false} strokeDasharray="3 3" />
												<XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} minTickGap={24} />
												<YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
												<ChartTooltip cursor={false} content={tooltipContent} />
												<Line
													type="monotone"
													dataKey={trend.key}
													stroke="var(--color-chars)"
													strokeWidth={2}
													dot={renderCustomDot}
													activeDot={{ r: 4, fill: "#000000", stroke: "#000000" }}
												/>
											</LineChart>
										</ChartContainer>
									</CardContent>
								</Card>
							))}
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
													{sessionLabels.get(report._id) || "Session"}
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
											<Link
												to={`/report/${report._id}`}
												state={{ sessionLabel: sessionLabels.get(report._id) || "Session" }}
											>
												View Details
											</Link>
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
