"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, Home, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-card border-r border-border flex flex-col">
      <div className="p-6 text-lg font-bold">Neighbour App</div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
          <Home className="h-5 w-5" /> Notice Board
        </Link>
        <Link href="/feed" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
          <PlusCircle className="h-5 w-5" /> New Notice
        </Link>
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
