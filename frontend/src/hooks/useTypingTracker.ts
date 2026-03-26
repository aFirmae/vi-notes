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

	const activeKeys = useRef<Map<string, { time: number; interval: number }>>(new Map())
	const lastKeyDownTime = useRef<number | null>(null)
	const lastKeyUpTime = useRef<number | null>(null)

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const now = Date.now()

		// Detect deletes
		if (e.key === "Backspace" || e.key === "Delete") {
			deleteCount.current += 1
		}

		// Detect pause since last keystroke
		if (lastKeyUpTime.current !== null && activeKeys.current.size === 0) {
			const gap = now - lastKeyUpTime.current
			if (gap > PAUSE_THRESHOLD_MS) {
				pauseEvents.current.push({ timestamp: now, durationMs: gap })
			}
		}

		const targetKey = e.code || e.key
		if (!activeKeys.current.has(targetKey)) {
			const interval = lastKeyDownTime.current !== null ? now - lastKeyDownTime.current : 0
			activeKeys.current.set(targetKey, { time: now, interval })
			lastKeyDownTime.current = now
		}
	}, [])

	const onKeyUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const now = Date.now()
		const targetKey = e.code || e.key
		const keyRecord = activeKeys.current.get(targetKey)

		if (keyRecord !== undefined) {
			keystrokeBuffer.current.push({
				keyDownTime: keyRecord.time,
				keyUpTime: now,
				interval: keyRecord.interval,
			})

			lastKeyUpTime.current = now
			activeKeys.current.delete(targetKey)
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
