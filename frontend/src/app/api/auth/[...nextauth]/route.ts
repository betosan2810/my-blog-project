import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"
import type { User } from "next-auth";
export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log("Request headers:", req.headers);
                if (!credentials) return null;

                try {
                    // Gọi API login của Flask
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
                        headers: { "Content-Type": "application/json" }
                    });

                    if (!res.ok) {
                        // Ném lỗi để hiển thị cho người dùng
                        const errorData = await res.json();
                        throw new Error(errorData.message || 'Invalid credentials');
                    }

                    const data = await res.json();

                    // Nếu login thành công, Flask trả về token và user
                    // Gộp chúng lại và trả về cho Next-Auth
                    if (data) {
                        return {
                            ...data.user, // id, username, email
                            accessToken: data.token // Thêm token vào đây
                        };
                    }

                    return null;

                } catch (e) {
                    if (e instanceof Error) {
                        throw new Error(e.message);
                    }
                    throw new Error('Unexpected error');
                }

            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // Callback này được gọi sau khi `authorize` thành công
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
            }
            return token;
        },
        // Callback này quyết định data nào của session sẽ được gửi về cho client
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user.id = token.id as string;
            return session;
        }
    },
    pages: {
        signIn: '/login', // Chuyển hướng người dùng đến trang /login
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };