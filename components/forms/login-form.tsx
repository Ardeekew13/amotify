"use client";

import { Form, Input, Button, Typography, Space, App } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";

const { Title, Text, Link } = Typography;

interface LoginFormData {
	userName: string;
	password: string;
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string | null }) {
	const [form] = Form.useForm();
	const router = useRouter();
	const { login, isLoading, status } = useAuthContext();
	const { message } = App.useApp();
	const [loginSuccess, setLoginSuccess] = useState(false);

	// Handle redirect after successful login and status update
	useEffect(() => {
		if (loginSuccess && status === "authenticated") {
			router.push(callbackUrl || "/dashboard");
		}
	}, [status, loginSuccess, router, callbackUrl]);

	const onFinish = async (values: LoginFormData) => {
		try {
			const result = await login(values.userName, values.password);

			if (result?.data?.login?.success) {
				message.success("Login successful!");
				setLoginSuccess(true);
			} else {
				message.error(result?.data?.login?.message || "Invalid credentials");
			}
		} catch (err: any) {
			message.error(err.message || "An error occurred");
		}
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<div style={{ textAlign: "center" }}>
				<Title level={2} style={{ marginBottom: 8 }}>
					Login to your account
				</Title>
				<Text type="secondary">
					Enter your username below to login to your account
				</Text>
			</div>

			<Form
				form={form}
				name="login"
				onFinish={onFinish}
				layout="vertical"
				size="large"
				disabled={isLoading}
			>
				<Form.Item
					name="userName"
					label="Username"
					rules={[
						{ required: true, message: "Please input your username!" },
						{ min: 3, message: "Username must be at least 3 characters" },
					]}
				>
					<Input prefix={<UserOutlined />} placeholder="Enter Username" />
				</Form.Item>

				<Form.Item
					name="password"
					label="Password"
					rules={[
						{ required: true, message: "Please input your password!" },
						{ min: 6, message: "Password must be at least 6 characters" },
					]}
				>
					<Input.Password
						prefix={<LockOutlined />}
						placeholder="Enter Password"
					/>
				</Form.Item>

				<Form.Item>
					<Button type="primary" htmlType="submit" loading={isLoading} block>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
				</Form.Item>
			</Form>

			<div style={{ textAlign: "center" }}>
				<Text type="secondary">
					Don&apos;t have an account? <Link href="/signup">Sign up</Link>
				</Text>
			</div>
		</Space>
	);
}
