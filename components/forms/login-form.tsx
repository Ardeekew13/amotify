"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";

// Zod validation schema
const signinSchema = z.object({
	userName: z.string().min(3, "Username must be at least 3 characters"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninFormData = z.infer<typeof signinSchema>;

export function LoginForm({
	className,
	callbackUrl,
	...props
}: React.ComponentPropsWithoutRef<"form"> & { callbackUrl?: string | null }) {
	const router = useRouter();
	const { login, isLoading } = useAuthContext();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SigninFormData>({
		resolver: zodResolver(signinSchema),
	});

	const isDisabled = isLoading || isSubmitting;

	const onSubmit = async (data: SigninFormData) => {

		try {
			const result = await login(data.userName, data.password);

			if (result?.data?.login?.success) {
				toast.success("Login Successful", {
					description: "You have been logged in successfully.",
				});
				
				// Redirect to original destination or dashboard
				router.push(callbackUrl || "/dashboard");
			} else {
				toast.error("Login Failed", {
					description: result?.data?.login?.message || "Invalid credentials",
				});
			}
		} catch (err: any) {
			toast.error("Error", {
				description: err.message || "An error occurred",
			});
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-6", className)}
			{...props}
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Login to your account</h1>
				<p className="text-balance text-sm text-muted-foreground">
					Enter your username below to login to your account
				</p>
			</div>

			<div className="grid gap-6">
				<div className="grid gap-2">
					<Label htmlFor="userName">Username</Label>
					<Input
						id="userName"
						type="text"
						placeholder="Enter Username"
						disabled={isDisabled}
						{...register("userName")}
					/>
					{errors.userName && (
						<span className="text-sm text-red-600">
							{errors.userName.message}
						</span>
					)}
				</div>
				<div className="grid gap-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Enter Password"
						disabled={isDisabled}
						{...register("password")}
					/>
					{errors.password && (
						<span className="text-sm text-red-600">
							{errors.password.message}
						</span>
					)}
				</div>
				<Button type="submit" className="w-full" disabled={isDisabled}>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{isSubmitting ? "Logging in..." : "Login"}
				</Button>
			</div>
			<div className="text-center text-sm">
				Don&apos;t have an account?{" "}
				<a href="/signup" className="underline underline-offset-4">
					Sign up
				</a>
			</div>
		</form>
	);
}
