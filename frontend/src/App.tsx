import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SessionProvider } from "./context/SessionContext"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Editor from "./pages/Editor"

function App() {
	return (
		<BrowserRouter>
			<SessionProvider>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/editor/:id" element={<Editor />} />
				</Routes>
			</SessionProvider>
		</BrowserRouter>
	)
}

export default App