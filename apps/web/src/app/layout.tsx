import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "Flowbit AI Dashboard",
  description: "Analytics Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f6f8fb] text-gray-800 overflow-x-hidden">
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-[#f6f8fb]">
            <Topbar />
            <main className="flex-1 p-8 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
