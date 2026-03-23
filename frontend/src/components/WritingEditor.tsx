import { LetterText, Hash } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import TiptapEditor from "./TiptapEditor"

interface WritingEditorProps {
	value: string
	onChange: (value: string) => void
	onKeyDown?: (e: React.KeyboardEvent<any>) => void
	onKeyUp?: (e: React.KeyboardEvent<any>) => void
	onPaste?: (e: React.ClipboardEvent<any>) => void
}

export default function WritingEditor({ value, onChange, onKeyDown, onKeyUp, onPaste }: WritingEditorProps) {
	const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

	return (
		<div className="w-full max-w-3xl space-y-4 animate-slide-up">
			<Card className="shadow-lg">
				<CardContent className="p-0">
					<TiptapEditor
						value={value}
						onChange={onChange}
						onKeyDown={onKeyDown}
						onKeyUp={onKeyUp}
						onPaste={onPaste}
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