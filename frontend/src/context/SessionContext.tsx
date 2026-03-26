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
	| { type: "UPDATE_SESSION"; payload: Partial<Session> & { _id: string } }
	| { type: "DELETE_SESSION"; payload: string }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }

interface SessionContextValue extends SessionState {
	fetchSessions: () => Promise<void>
	addSession: (data?: Partial<Pick<Session, "title" | "content">>) => Promise<string | undefined>
	updateSession: (_id: string, data: Partial<Omit<Session, "_id">>) => Promise<void>
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
					s._id === action.payload._id
						? { ...s, ...action.payload, updatedAt: new Date().toISOString() }
						: s
				),
			}
		case "DELETE_SESSION":
			return {
				...state,
				sessions: state.sessions.filter((s) => s._id !== action.payload),
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
		isLoading: true,
		error: null,
	})
	
const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

	const fetchSessions = useCallback(async () => {
		if (!isAuthenticated) return

		dispatch({ type: "SET_LOADING", payload: true })
		try {
			const { data } = await api.get("/api/sessions")
			dispatch({ type: "SET_SESSIONS", payload: data })
		} catch (err: any) {
			dispatch({ type: "SET_ERROR", payload: err.message || "Failed to fetch sessions" })
		}
	}, [isAuthenticated])

	useEffect(() => {
		if (isAuthLoading) return

		if (isAuthenticated) {
			fetchSessions()
		} else {
			dispatch({ type: "SET_SESSIONS", payload: [] }) // clear on logout
		}
	}, [isAuthLoading, isAuthenticated, fetchSessions])

	const addSession = async (data?: Partial<Pick<Session, "title" | "content">>): Promise<string | undefined> => {
		try {
			const { data: createdSession } = await api.post("/api/sessions", {
				title: data?.title ?? "",
				content: data?.content ?? "",
			})
			dispatch({ type: "ADD_SESSION", payload: createdSession })
			return createdSession._id
		} catch (err) {
			console.error("Failed to create session:", err)
		}
	}

	const updateSession = async (_id: string, data: Partial<Omit<Session, "_id">>) => {
		// Optimistically update UI
		dispatch({ type: "UPDATE_SESSION", payload: { _id, ...data } })
		try {
			await api.put(`/api/sessions/${_id}`, data)
		} catch (err: any) {
			if (err?.response?.status === 404) {
				dispatch({ type: "DELETE_SESSION", payload: _id })
				return
			}
			console.error("Failed to update session on server:", err)
			// Revert? (For now, just log error)
		}
	}

	const deleteSession = async (id: string) => {
		try {
			await api.delete(`/api/sessions/${id}`)
			dispatch({ type: "DELETE_SESSION", payload: id })
		} catch (err) {
			console.error("Failed to delete session on server:", err)
			throw err
		}
	}

	const getSession = (id: string) => {
		return state.sessions.find((s) => s._id === id)
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
