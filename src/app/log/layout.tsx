
import TopNav from "@/components/TopNav";

export default function LogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Log Activity
                </h1>
                <TopNav />
            </header>
            {children}
        </div>
    );
}
