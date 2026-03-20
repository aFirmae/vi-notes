import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { validateEmail } from "@/lib/validation"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/services/api"
import { PenLine, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

export default function Login() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		const emailError = validateEmail(email)
		if (emailError) {
			setErrors({ email: emailError })
			return
		}
		// Clear previous errors
		setErrors({})
		setIsSubmitting(true)

		try {
			const { data } = await api.post("/api/auth/login", { email, password })
			login(data.token, data.refreshToken, data.user)
			navigate("/dashboard")
		} catch (err: any) {
			const status = err.response?.status
			const message = err.response?.data?.message

			if (status === 404 || message === "User not found") {
				setErrors({ email: "This email is not registered" })
			} else if (status === 401 || message === "Invalid credentials") {
				setErrors({ password: "Password is incorrect" })
			} else {
				setErrors({ form: message || "Something went wrong. Please try again." })
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-background px-4">
			<div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40" />

			<div className="relative z-10 w-full max-w-md animate-fade-in-up">
				<div className="mb-8 flex flex-col items-center gap-3">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
						<PenLine className="size-7 text-primary-foreground" />
					</div>
					<span className="text-lg font-semibold tracking-tight text-foreground">
						Vi-Notes
					</span>
				</div>

				<Card className="shadow-xl">
					<CardHeader className="text-center pb-2">
						<CardTitle className="text-2xl font-bold tracking-tight">
							Welcome back
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Sign in to continue your writing sessions
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleLogin}>
						<CardContent className="space-y-4 pt-4">
							{errors.form && (
								<div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
									{errors.form}
								</div>
							)}

							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium text-foreground"
								>
									Email
								</label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value)
										if (errors.email) setErrors({ ...errors, email: undefined })
									}}
									className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
									required
								/>
								{errors.email && (
									<p className="text-xs font-medium text-destructive">{errors.email}</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									htmlFor="password"
									className="text-sm font-medium text-foreground"
								>
									Password
								</label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										className="pr-10"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										required
									/>
									<button
										type="button"
										tabIndex={-1}
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="text-xs font-medium text-destructive">{errors.password}</p>
								)}
							</div>
						</CardContent>

						<CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent pt-4">
							<Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
								{isSubmitting ? "Signing in..." : "Sign In"}
							</Button>
							<p className="text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link
									to="/register"
									className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70"
								>
									Register
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}
