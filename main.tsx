@import "tailwindcss";

@theme {
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Newsreader", "Lora", serif;
  --font-mono: "Space Grotesk", ui-monospace, SFMono-Regular, monospace;

  --color-primary-brand: #bb001e;
  --color-primary-dark: #111111;
  --color-surface-light: #f9f9f9;
  --color-border-subtle: rgba(0, 0, 0, 0.05);
}

@layer base {
  body {
    @apply bg-surface-light text-primary-dark antialiased;
  }
}

.glass-card {
  @apply bg-white/5 backdrop-blur-xl border border-white/10 rounded-[16px] shadow-2xl;
}

.clinical-card {
  @apply bg-white rounded-xl border border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.05)];
}

.sidebar-item-active {
  @apply bg-zinc-100 border-r-4 border-primary-brand font-bold text-primary-dark;
}

.sidebar-item {
  @apply text-zinc-500 hover:bg-zinc-50 hover:translate-x-1 transition-all duration-200 cursor-pointer;
}

/* Custom scrollbar for clinical areas */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-zinc-300 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-zinc-400;
}
