import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SessionProvider } from "./context/SessionContext"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Editor from "./pages/Editor"

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<SessionProvider>
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Login />} />
						<Route path="/register" element={<Register />} />
						
						{/* Protected Routes */}
						<Route element={<ProtectedRoute />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/editor/:id" element={<Editor />} />
						</Route>
					</Routes>
				</SessionProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App