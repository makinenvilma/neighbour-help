"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, Home, Megaphone, PlusCircle, UsersRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  // Inside /community/[slug] this is the community being viewed; on the index it
  // is undefined, so the nav falls back to the list of boards.
  const params = useParams<{ slug?: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : null;

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
      <div className="p-6 text-lg font-bold">Neighbour Help</div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
          <UsersRound className="h-5 w-5" /> Communities
        </Link>
        {slug && (
          <>
            <Link href={`/community/${slug}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
              <Home className="h-5 w-5" /> Home
            </Link>
            <Link href={`/community/${slug}/feed`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
              <Megaphone className="h-5 w-5" /> Notice Board
            </Link>
            <Link href={`/community/${slug}/new`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted">
              <PlusCircle className="h-5 w-5" /> New Notice
            </Link>
          </>
        )}
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
