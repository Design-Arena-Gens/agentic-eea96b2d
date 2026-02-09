import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "../components/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TaskFlow - Daily Planner",
  description:
    "TaskFlow helps busy professionals stay organized with powerful daily, weekly, and monthly planning tools."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="min-h-screen bg-slate-950">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
