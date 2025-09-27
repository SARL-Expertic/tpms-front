// components/magic-loaders/magical-pulse.tsx
export const MagicalPulse = () => {
  return (
    <div className="flex items-center justify-center space-x-4 py-12">
      {/* Pulsing orbs */}
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 
              animate-pulse [animation-duration:1.5s]"
            style={{ animationDelay: `${i * 0.3}s` }}
          ></div>
        ))}
      </div>
      
      {/* Text with wave animation */}
      <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 
        bg-[length:200%_100%] animate-gradient bg-clip-text text-transparent">
        Magical Loading...
      </span>
    </div>
  );
};