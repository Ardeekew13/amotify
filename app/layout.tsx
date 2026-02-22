import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AntdProvider } from "@/lib/antd-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amotify - Smart Expense Tracking & Splitting",
  description: "Simplify group expenses with Amotify. Track, split, and manage shared costs effortlessly with QR code payments and real-time expense management.",
  icons: {
    icon: '/amotify.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdProvider>
          <ApolloWrapper>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ApolloWrapper>
        </AntdProvider>
      </body>
    </html>
  );
}
