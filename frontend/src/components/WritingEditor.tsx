import { LetterText, Hash } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface WritingEditorProps {
	value: string
	onChange: (value: string) => void
}

export default function WritingEditor({ value, onChange }: WritingEditorProps) {
	const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

	return (
		<div className="w-full max-w-3xl space-y-4 animate-slide-up">
			<Card className="shadow-lg">
				<CardContent className="p-0">
					<Textarea
						className="min-h-[520px] resize-none rounded-xl border-0 px-8 py-8 text-lg leading-loose shadow-none focus-visible:ring-0 focus-visible:shadow-none"
						placeholder="Start writing..."
						value={value}
						onChange={(e) => onChange(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* ——— Status bar ——— */}
			<div className="flex items-center justify-end gap-5 px-1 text-xs font-medium text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<LetterText className="size-3.5" />
					{wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}
				</span>
				<span className="flex items-center gap-1.5">
					<Hash className="size-3.5" />
					{value.length.toLocaleString()} char{value.length !== 1 ? "s" : ""}
				</span>
			</div>
		</div>
	)
}