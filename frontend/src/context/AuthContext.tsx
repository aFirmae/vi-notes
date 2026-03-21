import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

interface User {
	_id: string
	fullName: string
	email: string
}

interface AuthContextValue {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (token: string, refreshToken: string, user: User) => void
	logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate()
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	// On mount, restore auth state from localStorage
	useEffect(() => {
		const storedToken = localStorage.getItem("token")
		const storedUser = localStorage.getItem("user")

		if (storedToken && storedUser) {
			setToken(storedToken)
			try {
				setUser(JSON.parse(storedUser))
			} catch (e) {
				console.error("Failed to parse stored user", e)
			}
		}
		setIsLoading(false)
	}, [])

	const login = (newToken: string, newRefreshToken: string, newUser: User) => {
		localStorage.setItem("token", newToken)
		localStorage.setItem("refreshToken", newRefreshToken)
		localStorage.setItem("user", JSON.stringify(newUser))
		setToken(newToken)
		setUser(newUser)
	}

	const logout = () => {
		localStorage.removeItem("token")
		localStorage.removeItem("refreshToken")
		localStorage.removeItem("user")
		setToken(null)
		setUser(null)
		navigate("/")
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!token,
				isLoading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
