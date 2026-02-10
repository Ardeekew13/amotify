import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AntdProvider } from "@/lib/antd-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amotify",
  description: "A modern full-stack template with shadcn/ui, GraphQL, and MongoDB",
  icons: {
    icon: 'data:,',
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
