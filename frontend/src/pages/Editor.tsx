import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, PenLine, Check, Trash2 } from "lucide-react"

import WritingEditor from "@/components/WritingEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/SessionContext"

export default function Editor() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { getSession, updateSession, deleteSession } = useSession()

	const session = id ? getSession(id) : undefined

	const [title, setTitle] = useState(session?.title ?? "")
	const [content, setContent] = useState(session?.content ?? "")
	const [saved, setSaved] = useState(false)

	const titleRef = useRef(title)
	const contentRef = useRef(content)
	const navigatingAway = useRef(false)
	titleRef.current = title
	contentRef.current = content

	// Sync changes to context
	useEffect(() => {
		if (!id) return
		updateSession(id, { title, content })
	}, [title, content])

	// Discard empty sessions on navigation
	useEffect(() => {
		const handlePopState = () => {
			navigatingAway.current = true
		}
		window.addEventListener("popstate", handlePopState)
		return () => {
			window.removeEventListener("popstate", handlePopState)
			if (navigatingAway.current && id && !titleRef.current.trim() && !contentRef.current.trim()) {
				deleteSession(id)
			}
		}
	}, [id, deleteSession])

	const handleBack = useCallback(() => {
		navigatingAway.current = true
		// Clean up empty session before navigating
		if (id && !titleRef.current.trim() && !contentRef.current.trim()) {
			deleteSession(id)
		}
		navigate("/dashboard")
	}, [id, deleteSession, navigate])

	const handleDelete = () => {
		if (!id) return
		navigatingAway.current = true
		deleteSession(id)
		navigate("/dashboard")
	}

	// Save feedback
	const handleSave = () => {
		setSaved(true)
		setTimeout(() => setSaved(false), 1500)
	}

	// If session doesn't exist then redirect
	if (id && !session) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center animate-fade-in">
					<p className="text-muted-foreground">Session not found.</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => navigate("/dashboard")}
					>
						Back to Dashboard
					</Button>
				</div>
			</div>
		)
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
				<WritingEditor value={content} onChange={setContent} />
			</main>
		</div>
	)
}