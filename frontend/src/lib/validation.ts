export function validateEmail(email: string): string | null {
	if (!email) return "Email is required";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
	return null;
}

export function validatePassword(password: string): string | null {
	if (!password) return "Password is required";
	if (password.length < 8) return "Password must be at least 8 characters";
	if (!/[A-Z]/.test(password)) return "Must contain at least one uppercase letter";
	if (!/[a-z]/.test(password)) return "Must contain at least one lowercase letter";
	if (!/[0-9]/.test(password)) return "Must contain at least one number";
	return null;
}

export function validateFullName(fullName: string): string | null {
	if (!fullName) return "Full name is required";
	if (fullName.trim().length < 2) return "Please enter your full name";
	if (!/^[a-zA-Z\s\-'\.]+$/.test(fullName)) return "Invalid characters in name";
	return null;
}

export function getPasswordStrength(password: string): {
	score: number;
	label: string;
	color: string;
} {
	if (!password) return { score: 0, label: "", color: "bg-muted" };
	let score = 0;
	if (password.length >= 8) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	switch (score) {
		case 0:
		case 1:
			return { score, label: "Weak", color: "bg-red-500" };
		case 2:
			return { score, label: "Fair", color: "bg-yellow-500" };
		case 3:
			return { score, label: "Good", color: "bg-blue-500" };
		case 4:
			return { score, label: "Strong", color: "bg-green-500" };
		default:
			return { score: 0, label: "", color: "bg-muted" };
	}
}
