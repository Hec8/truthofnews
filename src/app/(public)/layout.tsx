import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0f172a]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
