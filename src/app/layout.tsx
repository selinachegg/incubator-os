import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incubator OS",
  description: "Capture and structure insights from your startup journey",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen bg-[#0f1115] text-[#e0e0e0] font-body paper-grain flex antialiased">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-y-auto min-h-0">
          <TopNav />
          <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </body>
    </html>
  );
}
