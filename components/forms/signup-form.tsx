"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { setCookie } from "@/lib/cookies";

// Zod validation schema
const signupSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		userName: z.string().min(3, "Username must be at least 3 characters"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"form">) {
	const router = useRouter();
	const { signup, isLoading } = useAuth();

	// react-hook-form with zod validation
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	const onSubmit = async (formData: SignupFormData) => {
		try {
			const result = await signup(
				formData.firstName,
				formData.lastName,
				formData.userName,
				formData.password
			);

			if (result?.success) {
				toast.success("Success!", {
					description: "Account created successfully!",
				});

				// Store token in cookie for middleware
				if (result.token) {
					setCookie("auth_token", result.token, 7);
				}

				// Redirect to dashboard
				router.push("/dashboard");
			} else {
				toast.error("Error", {
					description: result?.message || "Failed to create account",
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
				<h1 className="text-2xl font-bold">Create an account</h1>
				<p className="text-balance text-sm text-muted-foreground">
					Enter your information to create your account
				</p>
			</div>

			<div className="grid gap-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="grid gap-2">
						<Label htmlFor="firstName">First name</Label>
						<Input
							id="firstName"
							placeholder="Enter First Name"
							disabled={isLoading}
							{...register("firstName")}
						/>
						{errors.firstName && (
							<span className="text-sm text-red-600">
								{errors.firstName.message}
							</span>
						)}
					</div>
					<div className="grid gap-2">
						<Label htmlFor="lastName">Last name</Label>
						<Input
							id="lastName"
							placeholder="Enter Last Name"
							disabled={isLoading}
							{...register("lastName")}
						/>
						{errors.lastName && (
							<span className="text-sm text-red-600">
								{errors.lastName.message}
							</span>
						)}
					</div>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="userName">Username</Label>
					<Input
						id="userName"
						type="text"
						placeholder="Enter Username"
						disabled={isLoading}
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
						disabled={isLoading}
						{...register("password")}
					/>
					{errors.password && (
						<span className="text-sm text-red-600">
							{errors.password.message}
						</span>
					)}
				</div>
				<div className="grid gap-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="Enter Confirm Password"
						disabled={isLoading}
						{...register("confirmPassword")}
					/>
					{errors.confirmPassword && (
						<span className="text-sm text-red-600">
							{errors.confirmPassword.message}
						</span>
					)}
				</div>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Creating account..." : "Create account"}
				</Button>
			</div>
			<div className="text-center text-sm">
				Already have an account?{" "}
				<a href="/login" className="underline underline-offset-4">
					Login
				</a>
			</div>
		</form>
	);
}
