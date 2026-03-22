import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { validateEmail, validatePassword, getPasswordStrength } from "@/lib/validation"
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

function PasswordField({
	id,
	label,
	placeholder,
	value,
	onChange,
	onFocus,
	onBlur,
	error,
}: {
	id: string
	label: string
	placeholder: string
	value: string
	onChange: (v: string) => void
	onFocus?: () => void
	onBlur?: () => void
	error?: string
}) {
	const [show, setShow] = useState(false)

	return (
		<div className="space-y-2">
			<label htmlFor={id} className="text-sm font-medium text-foreground">
				{label}
			</label>
			<div className="relative">
				<Input
					id={id}
					type={show ? "text" : "password"}
					placeholder={placeholder}
					className={`pr-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={onFocus}
					onBlur={onBlur}
					required
				/>
				<button
					type="button"
					tabIndex={-1}
					onClick={() => setShow(!show)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
				>
					{show ? (
						<EyeOff className="size-4" />
					) : (
						<Eye className="size-4" />
					)}
				</button>
			</div>
			{error && <p className="text-xs font-medium text-destructive">{error}</p>}
		</div>
	)
}

export default function Register() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [fullName, setFullName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirm?: string; form?: string }>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const strength = getPasswordStrength(password)

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		
		const nameError = fullName.trim().length < 2 ? "Please enter your full name" : null
		const emailError = validateEmail(email)
		const pwError = validatePassword(password)
		const confirmError = password !== confirmPassword ? "Passwords do not match" : null

		if (nameError || emailError || pwError || confirmError) {
			setErrors({ fullName: nameError || undefined, email: emailError || undefined, password: pwError || undefined, confirm: confirmError || undefined })
			return
		}

		setErrors({})
		setIsSubmitting(true)

		try {
			const { data } = await api.post("/api/auth/register", { fullName, email, password })
			login(data.token, data.refreshToken, data.user)
			navigate("/dashboard", { state: { fromRegister: true } })
		} catch (err: any) {
			const status = err.response?.status
			const message = err.response?.data?.message

			if (status === 409 || message === "User already exists") {
				setErrors({ email: "An account with this email already exists" })
			} else if (err.response?.data?.errors) {
				setErrors(err.response.data.errors)
			} else {
				setErrors({ form: message || "Registration failed. Please try again." })
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-background px-4">
			<div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40" />

			<div className="relative z-10 w-full max-w-md animate-fade-in-up">
				{/* brand mark */}
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
							Create an account
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Get started with Vi-Notes
						</CardDescription>
					</CardHeader>

					<form onSubmit={handleRegister}>
						<CardContent className="space-y-4 pt-4">
							{errors.form && (
								<div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
									{errors.form}
								</div>
							)}

							<div className="space-y-2">
								<label
									htmlFor="reg-fullname"
									className="text-sm font-medium text-foreground"
								>
									Full Name
								</label>
								<Input
									id="reg-fullname"
									type="text"
									placeholder="Your Name"
									value={fullName}
									onChange={(e) => {
										setFullName(e.target.value)
										if (errors.fullName) setErrors({ ...errors, fullName: undefined })
									}}
									className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
									required
								/>
								{errors.fullName && (
									<p className="text-xs font-medium text-destructive">{errors.fullName}</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									htmlFor="reg-email"
									className="text-sm font-medium text-foreground"
								>
									Email
								</label>
								<Input
									id="reg-email"
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
								<PasswordField
									id="reg-password"
									label="Password"
									placeholder="Create a password"
									value={password}
									onChange={(val) => {
										setPassword(val)
										if (errors.password) setErrors({ ...errors, password: undefined })
									}}
									error={errors.password}
								/>
								
								{/* Password Strength Meter */}
								{password.length > 0 && (
									<div className="mt-2 space-y-1.5 animate-fade-in">
										<div className="flex justify-between text-xs">
											<span className="font-medium text-muted-foreground">Password strength</span>
											<span className={`font-semibold ${strength.score >= 3 ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}>
												{strength.label}
											</span>
										</div>
										<div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
											<div 
												className={`h-full transition-all duration-300 ${strength.color}`} 
												style={{ width: `${(Math.max(strength.score, 1) / 4) * 100}%`, opacity: password.length === 0 ? 0 : 1 }}
											/>
										</div>
									</div>
								)}
							</div>

							<PasswordField
								id="reg-confirm"
								label="Confirm Password"
								placeholder="Re-enter your password"
								value={confirmPassword}
								onChange={(val) => {
									setConfirmPassword(val)
									if (errors.confirm) setErrors({ ...errors, confirm: undefined })
								}}
								error={errors.confirm}
							/>
						</CardContent>

						<CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent pt-4">
							<Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
								{isSubmitting ? "Creating account..." : "Create Account"}
							</Button>
							<p className="text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link
									to="/"
									className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70"
								>
									Sign In
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	)
}
