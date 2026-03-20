import {
	createContext,
	useContext,
	useReducer,
	type ReactNode,
} from "react"

// ——— Types ———
export interface Session {
	id: string
	title: string
	content: string
	createdAt: string
	updatedAt: string
}

interface SessionState {
	sessions: Session[]
}

type SessionAction =
	| { type: "ADD_SESSION"; payload: Session }
	| { type: "UPDATE_SESSION"; payload: Partial<Session> & { id: string } }
	| { type: "DELETE_SESSION"; payload: string }

interface SessionContextValue extends SessionState {
	addSession: () => string
	updateSession: (id: string, data: Partial<Omit<Session, "id">>) => void
	deleteSession: (id: string) => void
	getSession: (id: string) => Session | undefined
}

// ——— Reducer ———
function sessionReducer(
	state: SessionState,
	action: SessionAction
): SessionState {
	switch (action.type) {
		case "ADD_SESSION":
			return { sessions: [...state.sessions, action.payload] }
		case "UPDATE_SESSION":
			return {
				sessions: state.sessions.map((s) =>
					s.id === action.payload.id
						? { ...s, ...action.payload, updatedAt: new Date().toISOString() }
						: s
				),
			}
		case "DELETE_SESSION":
			return {
				sessions: state.sessions.filter((s) => s.id !== action.payload),
			}
		default:
			return state
	}
}

// ——— Context ———
const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(sessionReducer, { sessions: [] })

	const addSession = (): string => {
		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		dispatch({
			type: "ADD_SESSION",
			payload: { id, title: "", content: "", createdAt: now, updatedAt: now },
		})
		return id
	}

	const updateSession = (id: string, data: Partial<Omit<Session, "id">>) => {
		dispatch({ type: "UPDATE_SESSION", payload: { id, ...data } })
	}

	const deleteSession = (id: string) => {
		dispatch({ type: "DELETE_SESSION", payload: id })
	}

	const getSession = (id: string) => {
		return state.sessions.find((s) => s.id === id)
	}

	return (
		<SessionContext.Provider
			value={{ ...state, addSession, updateSession, deleteSession, getSession }}
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
