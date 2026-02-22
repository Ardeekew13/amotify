"use client";

import {
	Form,
	Input,
	Button,
	Typography,
	Space,
	App,
	Spin,
	Row,
	Col,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/app/api/graphql/user";
import { setCookie } from "@/lib/cookies";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/amotify.png";

const { Title, Text, Link } = Typography;

interface LoginFormData {
	userName: string;
	password: string;
}

interface LoginFormProps {
	callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
	const [form] = Form.useForm();
	const router = useRouter();
	const { setAuth, status } = useAuthContext();
	const { message } = App.useApp();
	const [loginSuccess, setLoginSuccess] = useState(false);
	const [loginMutation, { loading: isLoading }] = useMutation(LOGIN_MUTATION);

	// Handle redirect after successful login and status update
	useEffect(() => {
		if (loginSuccess && status === "authenticated") {
			router.push(callbackUrl);
		}
	}, [status, loginSuccess, router, callbackUrl]);

	const onFinish = async (values: LoginFormData) => {
		try {
			const response = await loginMutation({
				variables: {
					userName: values.userName,
					password: values.password,
				},
			});

			if (response?.data?.login?.success) {
				const { token, user } = response.data.login;

				// Set cookie
				setCookie("token", token);

				// Update auth state
				await setAuth(user, token);

				message.success("Login successful!");
				setLoginSuccess(true);
			} else {
				message.error(response?.data?.login?.message || "Invalid credentials");
			}
		} catch (err: any) {
			message.error(err.message || "An error occurred");
		}
	};

	// Show loading spinner when authenticating or redirecting
	if (isLoading || loginSuccess) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<Row style={{ minHeight: "100vh", width: "100%", margin: 0 }}>
			{/* Left Column - Form */}
			<Col
				xs={24}
				md={12}
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "48px 24px",
				}}
			>
				<div style={{ width: "100%", maxWidth: "420px" }}>
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
								<Button type="primary" htmlType="submit" block>
									Login
								</Button>
							</Form.Item>
						</Form>

						<div style={{ textAlign: "center" }}>
							<Text type="secondary">
								Don&apos;t have an account? <Link href="/signup">Sign up</Link>
							</Text>
						</div>
					</Space>
				</div>
			</Col>

			{/* Right Column - Image */}
			<Col
				xs={0}
				md={12}
				style={{
					position: "relative",
					backgroundColor: "#f5f5f5",
				}}
			>
				<div
					style={{
						position: "relative",
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "48px",
					}}
				>
					<Image
						src={logo}
						alt="Amotify"
						width={500}
						height={500}
						style={{
							maxWidth: "100%",
							height: "auto",
							objectFit: "contain",
						}}
						priority
					/>
				</div>
			</Col>
		</Row>
	);
}
