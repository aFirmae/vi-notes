import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
}: {
	id: string
	label: string
	placeholder: string
	value: string
	onChange: (v: string) => void
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
					className="pr-10"
					value={value}
					onChange={(e) => onChange(e.target.value)}
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
		</div>
	)
}

export default function Register() {
	const navigate = useNavigate()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault()
		navigate("/dashboard", { state: { fromRegister: true } })
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
						<CardContent className="space-y-5 pt-4">
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
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							<PasswordField
								id="reg-password"
								label="Password"
								placeholder="Create a password"
								value={password}
								onChange={setPassword}
							/>

							<PasswordField
								id="reg-confirm"
								label="Confirm Password"
								placeholder="Re-enter your password"
								value={confirmPassword}
								onChange={setConfirmPassword}
							/>
						</CardContent>

						<CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent pt-4">
							<Button type="submit" size="lg" className="mt-2 w-full">
								Create Account
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
