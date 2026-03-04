import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hybrid QC DR Detection",
  description: "Diabetic Retinopathy Detection using Hybrid Quantum-Classical Deep Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed w-full z-20 top-0 start-0 border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-medical-800 tracking-tight">
                VQC<span className="text-medical-500">Vision</span>
              </span>
            </a>
            <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
              <a href="/upload">
                <button type="button" className="text-white bg-medical-600 hover:bg-medical-700 focus:ring-4 focus:outline-none focus:ring-medical-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300">New Scan</button>
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-20 pb-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
