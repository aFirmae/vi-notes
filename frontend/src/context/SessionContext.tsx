import {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useCallback,
	type ReactNode,
} from "react"
import { api } from "@/services/api"
import { useAuth } from "./AuthContext"

// ——— Types ———
export interface Session {
	_id: string
	id: string // mapped from _id
	title: string
	content: string
	createdAt: string
	updatedAt: string
}

interface SessionState {
	sessions: Session[]
	isLoading: boolean
	error: string | null
}

type SessionAction =
	| { type: "SET_SESSIONS"; payload: Session[] }
	| { type: "ADD_SESSION"; payload: Session }
	| { type: "UPDATE_SESSION"; payload: Partial<Session> & { id: string } }
	| { type: "DELETE_SESSION"; payload: string }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }

interface SessionContextValue extends SessionState {
	fetchSessions: () => Promise<void>
	addSession: () => Promise<string | undefined>
	updateSession: (id: string, data: Partial<Omit<Session, "id" | "_id">>) => Promise<void>
	deleteSession: (id: string) => Promise<void>
	getSession: (id: string) => Session | undefined
}

// ——— Reducer ———
function sessionReducer(
	state: SessionState,
	action: SessionAction
): SessionState {
	switch (action.type) {
		case "SET_SESSIONS":
			return { ...state, sessions: action.payload, isLoading: false, error: null }
		case "ADD_SESSION":
			return { ...state, sessions: [action.payload, ...state.sessions] }
		case "UPDATE_SESSION":
			return {
				...state,
				sessions: state.sessions.map((s) =>
					s.id === action.payload.id
						? { ...s, ...action.payload, updatedAt: new Date().toISOString() }
						: s
				),
			}
		case "DELETE_SESSION":
			return {
				...state,
				sessions: state.sessions.filter((s) => s.id !== action.payload),
			}
		case "SET_LOADING":
			return { ...state, isLoading: action.payload }
		case "SET_ERROR":
			return { ...state, error: action.payload, isLoading: false }
		default:
			return state
	}
}

// ——— Context ———
const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(sessionReducer, {
		sessions: [],
		isLoading: false,
		error: null,
	})
	
	const { isAuthenticated } = useAuth()

	const fetchSessions = useCallback(async () => {
		if (!isAuthenticated) return
		
		dispatch({ type: "SET_LOADING", payload: true })
		try {
			const { data } = await api.get("/api/sessions")
			// Map backend _id to frontend id
			const mappedSessions = data.map((s: any) => ({ ...s, id: s._id }))
			dispatch({ type: "SET_SESSIONS", payload: mappedSessions })
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", payload: err.message || "Failed to fetch sessions" })
		}
	}, [isAuthenticated])

	// Fetch automatically when auth state becomes ready
	useEffect(() => {
		if (isAuthenticated) {
			fetchSessions()
		} else {
			dispatch({ type: "SET_SESSIONS", payload: [] }) // clear on logout
		}
	}, [isAuthenticated, fetchSessions])

	const addSession = async (): Promise<string | undefined> => {
		try {
			const { data } = await api.post("/api/sessions", { title: "", content: "" })
			const newSession = { ...data, id: data._id }
			dispatch({ type: "ADD_SESSION", payload: newSession })
			return newSession.id
		} catch (err) {
			console.error("Failed to create session:", err)
		}
	}

	const updateSession = async (id: string, data: Partial<Omit<Session, "id" | "_id">>) => {
		// Optimistically update UI
		dispatch({ type: "UPDATE_SESSION", payload: { id, ...data } })
		try {
			await api.put(`/api/sessions/${id}`, data)
		} catch (err) {
			console.error("Failed to update session on server:", err)
			// Revert? (For now, we just log error)
		}
	}

	const deleteSession = async (id: string) => {
		// Optimistically update UI
		dispatch({ type: "DELETE_SESSION", payload: id })
		try {
			await api.delete(`/api/sessions/${id}`)
		} catch (err) {
			console.error("Failed to delete session on server:", err)
		}
	}

	const getSession = (id: string) => {
		return state.sessions.find((s) => s.id === id)
	}

	return (
		<SessionContext.Provider
			value={{ ...state, fetchSessions, addSession, updateSession, deleteSession, getSession }}
		>
			{children}
		</SessionContext.Provider>
	)
}

export function useSession() {
	const ctx = useContext(SessionContext)
	if (!ctx) throw new Error("useSession must be used inside SessionProvider")
	return ctx
}
