import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SessionProvider } from "./context/SessionContext"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Editor from "./pages/Editor"
import UsersPage from "./pages/UsersPage"
import UserReportPage from "./pages/UserReportPage"
import ReportDetails from "./pages/ReportDetails"
import NotFound from "./pages/NotFound"

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<SessionProvider>
					<Routes>
						{/* Public Routes */}
						<Route path="/" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/users" element={<UsersPage />} />
						<Route path="/users/:userId" element={<UserReportPage />} />
						<Route path="/report/:id" element={<ReportDetails />} />
						
						{/* Protected Routes */}
						<Route element={<ProtectedRoute />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/editor/:id" element={<Editor />} />
						</Route>

						{/* 404 Page */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</SessionProvider>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App