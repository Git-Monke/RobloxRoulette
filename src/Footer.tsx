import { MessageSquare, Gamepad } from "lucide-react";

const FloatingFooter = ({ gameCount }: { gameCount: number }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <a
        href="https://discord.gg/qgjBvAhJGs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-4 py-3 rounded-full bg-[#5865F2] text-white hover:bg-[#4752C4] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
      >
        <MessageSquare className="h-5 w-5 group-hover:animate-pulse" />
        <span className="font-medium text-sm">Join the Discord!</span>
      </a>
      <div className="flex items-center space-x-2 px-4 py-3 rounded-full bg-slate-700 text-white hover:bg-gray transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group">
        <Gamepad className="h-5 w-5 group-hover:animate-pulse" />
        <span className="font-medium text-sm">
          Game Count: {new Intl.NumberFormat().format(gameCount)}
        </span>
      </div>
    </div>
  );
};

export default FloatingFooter;
