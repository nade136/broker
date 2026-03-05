 "use client";

import { useTheme, type Theme } from "./ThemeProvider";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 p-0.5 text-xs shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              active
                ? "bg-[#141d22] text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

