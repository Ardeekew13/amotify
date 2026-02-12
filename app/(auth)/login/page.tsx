import { LoginForm } from "@/components/auth/LoginForm";
import { AuthCard } from "@/components/auth/AuthCard";

interface LoginPageProps {
	searchParams: {
		callbackUrl?: string;
	};
}

export default function LoginPage({ searchParams }: LoginPageProps) {
	const callbackUrl = searchParams.callbackUrl || "/dashboard";

	return (
		<AuthCard>
			<LoginForm callbackUrl={callbackUrl} />
		</AuthCard>
	);
}
