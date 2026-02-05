"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
	const [isLoading, setIsLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		// Add your signup logic here
		setTimeout(() => {
			setIsLoading(false);
		}, 2000);
	}

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Create an account</CardTitle>
				<CardDescription>
					Enter your information to create your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit}>
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="first-name">First name</Label>
								<Input id="first-name" placeholder="John" required />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="last-name">Last name</Label>
								<Input id="last-name" placeholder="Doe" required />
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirm-password">Confirm Password</Label>
							<Input id="confirm-password" type="password" required />
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
						<Button variant="outline" className="w-full" type="button">
							Sign up with GitHub
						</Button>
					</div>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link href="/login" className="underline">
							Login
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
