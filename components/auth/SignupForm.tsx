"use client";

import { Form, Input, Button, Typography, Space, App, Row, Col, Spin } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "@/app/api/graphql/user";
import { setCookie } from "@/lib/cookies";
import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/amotify.png"

const { Title, Text, Link } = Typography;

interface SignupFormData {
	firstName: string;
	lastName: string;
	userName: string;
	password: string;
	confirmPassword: string;
}

export function SignupForm() {
	const [form] = Form.useForm();
	const router = useRouter();
	const { setAuth } = useAuthContext();
	const { message } = App.useApp();
	const [signupSuccess, setSignupSuccess] = useState(false);
	const [signupMutation, { loading: isLoading }] = useMutation(SIGNUP_MUTATION);

	const onFinish = async (values: SignupFormData) => {
		try {
			const response = await signupMutation({
				variables: {
					firstName: values.firstName,
					lastName: values.lastName,
					userName: values.userName,
					password: values.password,
				},
			});

			if (response?.data?.createUser?.success) {
				const { token, user } = response.data.createUser;
				
				// Set cookie
				setCookie("token", token);
				
				// Update auth state
				await setAuth(user, token);
				
				message.success("Account created successfully!");
				setSignupSuccess(true);
				router.push("/dashboard");
			} else {
				message.error(
					response?.data?.createUser?.message || "Failed to create account"
				);
			}
		} catch (err: any) {
			message.error(err.message || "An error occurred");
		}
	};

	// Show loading spinner when creating account or redirecting
	if (isLoading || signupSuccess) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
					padding: "48px 24px"
				}}
			>
				<div style={{ width: "100%", maxWidth: "420px" }}>
					<Space direction="vertical" size="large" style={{ width: "100%" }}>
						<div style={{ textAlign: "center" }}>
							<Title level={2} style={{ marginBottom: 8 }}>
								Create an account
							</Title>
							<Text type="secondary">
								Enter your information to create your account
							</Text>
						</div>

						<Form
							form={form}
							name="signup"
							onFinish={onFinish}
							layout="vertical"
							size="large"
						>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										name="firstName"
										label="First name"
										rules={[{ required: true, message: "First name is required" }]}
									>
										<Input placeholder="Enter First Name" />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										name="lastName"
										label="Last name"
										rules={[{ required: true, message: "Last name is required" }]}
									>
										<Input placeholder="Enter Last Name" />
									</Form.Item>
								</Col>
							</Row>

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
								<Input.Password prefix={<LockOutlined />} placeholder="Enter Password" />
							</Form.Item>

							<Form.Item
								name="confirmPassword"
								label="Confirm Password"
								dependencies={["password"]}
								rules={[
									{ required: true, message: "Please confirm your password!" },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue("password") === value) {
												return Promise.resolve();
											}
											return Promise.reject(new Error("Passwords do not match!"));
										},
									}),
								]}
							>
								<Input.Password
									prefix={<LockOutlined />}
									placeholder="Enter Confirm Password"
								/>
							</Form.Item>

							<Form.Item>
								<Button type="primary" htmlType="submit" block>
									Create account
								</Button>
							</Form.Item>
						</Form>

						<div style={{ textAlign: "center" }}>
							<Text type="secondary">
								Already have an account? <Link href="/login">Login</Link>
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
					backgroundColor: "#f5f5f5"
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
						padding: "48px"
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
							objectFit: "contain"
						}}
						priority
					/>
				</div>
			</Col>
		</Row>
	);
}
