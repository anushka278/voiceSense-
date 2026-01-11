'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR hydration issues with localStorage
const App = dynamic(() => import('@/components/App').then(mod => ({ default: mod.App })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8BA888] to-[#5A7A57] rounded-2xl transform rotate-3 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#C4846C] to-[#A66B53] rounded-2xl transform -rotate-3 opacity-60 animate-pulse" />
        </div>
        <p className="text-[#9B918A] font-medium">Loading Sage...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <App />;
}
