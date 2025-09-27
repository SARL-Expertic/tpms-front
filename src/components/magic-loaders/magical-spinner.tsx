// components/magic-loaders/magical-spinner.tsx
export const MagicalSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      {/* Main Spinner */}
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 blur-lg opacity-50 animate-spin"></div>
        
        {/* Spinner */}
        <div className="relative w-16 h-16 border-4 border-transparent rounded-full 
          bg-gradient-to-r from-purple-400 to-blue-500 
          animate-spin [animation-duration:1.5s]
          after:content-[''] after:absolute after:inset-2 after:rounded-full after:bg-white dark:after:bg-gray-900">
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0.5s]"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.7s]"></div>
      </div>
      
      {/* Text with gradient animation */}
      <div className="text-center">
        <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 
          bg-[length:200%_100%] animate-gradient bg-clip-text text-transparent">
          Chargement des tickets...
        </span>
      </div>
    </div>
  );
};