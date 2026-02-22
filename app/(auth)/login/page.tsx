import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
	searchParams: {
		callbackUrl?: string;
	};
}

export default function LoginPage({ searchParams }: LoginPageProps) {
	const callbackUrl = searchParams.callbackUrl || "/dashboard";

	return <LoginForm callbackUrl={callbackUrl} />;
}
