import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, PenLine, Check, Trash2 } from "lucide-react"

import WritingEditor from "@/components/WritingEditor"
import NotFound from "@/pages/NotFound"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/SessionContext"
import { useAuth } from "@/context/AuthContext"
import { useTypingTracker } from "@/hooks/useTypingTracker"
import { api } from "@/services/api"

export default function Editor() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { getSession, addSession, updateSession, deleteSession, isLoading } = useSession()
	const { user } = useAuth()
	const tracker = useTypingTracker()

	const isNewDraft = !id || id === "new"
	const [sessionId, setSessionId] = useState<string | undefined>(isNewDraft ? undefined : id)
	const session = sessionId ? getSession(sessionId) : undefined

	const [title, setTitle] = useState(session?.title ?? "")
	const [content, setContent] = useState(session?.content ?? "")
	const [saved, setSaved] = useState(false)
	const hasAnyKeystrokeRef = useRef(false)
	const creatingSessionRef = useRef(false)
	const titleInputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (!id || id === "new") {
			setSessionId(undefined)
			return
		}
		setSessionId(id)
	}, [id])

	// Sync changes to context
	useEffect(() => {
		if (!sessionId || !session) return
		if (title === session?.title && content === session?.content) return
		
		updateSession(sessionId, { title, content })
	}, [title, content, sessionId, session?.title, session?.content, updateSession])

	const latestState = useRef({ title, content })
	useEffect(() => {
		latestState.current = { title, content }
	}, [title, content])

	const shouldPersistDraft = useCallback((currentTitle: string) => {
		return hasAnyKeystrokeRef.current || currentTitle.trim().length > 0
	}, [])

	const ensureSessionExists = useCallback(async (currentTitle: string, currentContent: string) => {
		if (sessionId || !user || creatingSessionRef.current) return sessionId
		if (!shouldPersistDraft(currentTitle)) return undefined

		creatingSessionRef.current = true
		try {
			const createdSessionId = await addSession({ title: currentTitle, content: currentContent })
			if (createdSessionId) {
				setSessionId(createdSessionId)
				navigate(`/editor/${createdSessionId}`, { replace: true })
			}
			return createdSessionId
		} finally {
			creatingSessionRef.current = false
		}
	}, [sessionId, user, shouldPersistDraft, addSession, navigate])

	useEffect(() => {
		if (sessionId || !user) return
		ensureSessionExists(title, content)
	}, [title, content, sessionId, user, ensureSessionExists])

	const flushDelta = useCallback(async (currentTitle: string, currentContent: string) => {
		if (!user) return

		let targetSessionId = sessionId
		if (!targetSessionId) {
			targetSessionId = await ensureSessionExists(currentTitle, currentContent)
		}
		if (!targetSessionId) return

		const keystrokeEvents = tracker.keystrokeBuffer.current
		const pasteEvents = tracker.pasteBuffer.current
		const pauseEvents = tracker.pauseEvents.current

		const deltaKeystrokes = keystrokeEvents.length
		const deltaInterval = keystrokeEvents.reduce((sum, keystroke) => sum + keystroke.interval, 0)
		const deltaPauses = pauseEvents.length
		const deltaPastes = pasteEvents.length
		const deltaPastedChars = pasteEvents.reduce((sum, pasteEvent) => sum + pasteEvent.length, 0)
		const deltaDeletes = tracker.deleteCount.current

		tracker.resetTracker()

		const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0
		const payload = {
			userId: user._id,
			userEmail: user.email,
			userFullName: user.fullName || "Writer",
			wordCount,
			characterCount: currentContent.length,
			deltaKeystrokes,
			deltaInterval,
			deltaPauses,
			deltaPastes,
			deltaPastedChars,
			deltaDeletes,
		}

		try {
			await api.put(`/api/reports/session/${targetSessionId}/delta`, payload)
		} catch (err) {
			console.error("Failed to auto-upsert behavior report:", err)
		}
	}, [sessionId, user, tracker, ensureSessionExists])

	const flushRef = useRef(flushDelta)
	useEffect(() => {
		flushRef.current = flushDelta
	}, [flushDelta])

	useEffect(() => {
		const intervalId = setInterval(() => {
			const hasDeltas =
				tracker.keystrokeBuffer.current.length > 0 ||
				tracker.pasteBuffer.current.length > 0 ||
				tracker.pauseEvents.current.length > 0 ||
				tracker.deleteCount.current > 0
			
			if (hasDeltas) {
				flushRef.current(latestState.current.title, latestState.current.content)
			}
		}, 5000)
		return () => clearInterval(intervalId)
	}, [tracker])

	useEffect(() => {
		return () => {
			flushRef.current(latestState.current.title, latestState.current.content)
		}
	}, [])

	const handleBack = useCallback(() => {
		navigate("/dashboard")
	}, [navigate])

	const handleDelete = () => {
		if (sessionId) {
			deleteSession(sessionId)
		}
		navigate("/dashboard")
	}

	// Save feedback
	const handleSave = async () => {
		let targetSessionId = sessionId
		if (!targetSessionId) {
			targetSessionId = await ensureSessionExists(title, content)
		}

		if (targetSessionId) {
			await updateSession(targetSessionId, { title, content })
		}
		setSaved(true)
		setTimeout(() => setSaved(false), 1500)
	}

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background animate-fade-in-up">
				<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
				<p className="text-sm text-muted-foreground tracking-tight">Loading session editor...</p>
			</div>
		)
	}

	if (sessionId && !session) {
		return <NotFound homeHref="/dashboard" />
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* ——— Sticky header ——— */}
			<header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
					<div className="flex items-center gap-3 min-w-0 flex-1">
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleBack}
						>
							<ArrowLeft className="size-4" />
						</Button>

						<div className="h-5 w-px bg-border shrink-0" />

						<div className="flex items-center gap-2 min-w-0 flex-1">
							<PenLine className="size-4 text-muted-foreground shrink-0" />
							<Input
								ref={titleInputRef}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Untitled session"
								className="h-8 border-0 bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:ring-0 focus-visible:shadow-none"
							/>
						</div>
					</div>

					<div className="flex items-center gap-2 ml-3 shrink-0">
						<Button
							size="sm"
							variant="ghost"
							onClick={handleDelete}
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 className="size-4" />
						</Button>

						<Button
							size="sm"
							variant="outline"
							onClick={handleSave}
						>
							{saved ? (
								<>
									<Check className="size-3.5 text-green-600" />
									Saved
								</>
							) : (
								<>
									<Save className="size-3.5" />
									Save
								</>
							)}
						</Button>
					</div>
				</div>
			</header>

			{/* ——— Editor area ——— */}
			<main className="flex flex-1 justify-center px-6 py-10 animate-fade-in">
				<WritingEditor
					value={content}
					onChange={setContent}
					onKeyDown={(e) => {
						hasAnyKeystrokeRef.current = true
						tracker.onKeyDown(e)
					}}
					onKeyUp={tracker.onKeyUp}
					onPaste={tracker.onPaste}
				/>
			</main>
		</div>
	)
}