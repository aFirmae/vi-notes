import { useRef, useCallback } from "react"

export interface KeystrokeEntry {
	keyDownTime: number
	keyUpTime: number
	interval: number
}

export interface PasteEntry {
	timestamp: number
	length: number
}

export interface PauseEntry {
	timestamp: number
	durationMs: number
}

export interface TypingTrackerResult {
	keystrokeBuffer: React.MutableRefObject<KeystrokeEntry[]>
	pasteBuffer: React.MutableRefObject<PasteEntry[]>
	pauseEvents: React.MutableRefObject<PauseEntry[]>
	deleteCount: React.MutableRefObject<number>
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
	onKeyUp: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
	onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
	resetTracker: () => void
}

const PAUSE_THRESHOLD_MS = 2000

export function useTypingTracker(): TypingTrackerResult {
	const keystrokeBuffer = useRef<KeystrokeEntry[]>([])
	const pasteBuffer = useRef<PasteEntry[]>([])
	const pauseEvents = useRef<PauseEntry[]>([])
	const deleteCount = useRef(0)

	// Internal timing refs
	const lastKeyDownTime = useRef<number | null>(null)
	const lastKeyUpTime = useRef<number | null>(null)
	const keyDownAtRef = useRef<number | null>(null)

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const now = Date.now()

		// Detect deletes
		if (e.key === "Backspace" || e.key === "Delete") {
			deleteCount.current += 1
		}

		// Detect pause since last keystroke
		if (lastKeyUpTime.current !== null) {
			const gap = now - lastKeyUpTime.current
			if (gap > PAUSE_THRESHOLD_MS) {
				pauseEvents.current.push({ timestamp: now, durationMs: gap })
			}
		}

		keyDownAtRef.current = now
	}, [])

	const onKeyUp = useCallback((_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const now = Date.now()
		const keyDownTime = keyDownAtRef.current

		if (keyDownTime !== null) {
			const interval =
				lastKeyDownTime.current !== null ? keyDownTime - lastKeyDownTime.current : 0

			keystrokeBuffer.current.push({
				keyDownTime,
				keyUpTime: now,
				interval,
			})

			lastKeyDownTime.current = keyDownTime
			lastKeyUpTime.current = now
			keyDownAtRef.current = null
		}
	}, [])

	const onPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const text = e.clipboardData.getData("text")
		pasteBuffer.current.push({
			timestamp: Date.now(),
			length: text.length,
		})
	}, [])

	const resetTracker = useCallback(() => {
		keystrokeBuffer.current = []
		pasteBuffer.current = []
		pauseEvents.current = []
		deleteCount.current = 0
		lastKeyDownTime.current = null
		lastKeyUpTime.current = null
		keyDownAtRef.current = null
	}, [])

	return {
		keystrokeBuffer,
		pasteBuffer,
		pauseEvents,
		deleteCount,
		onKeyDown,
		onKeyUp,
		onPaste,
		resetTracker,
	}
}
