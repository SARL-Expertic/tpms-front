"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-200/50 p-8 text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            
            {/* Pulsing Animation */}
            <div className="absolute inset-0 w-20 h-20 bg-blue-400 rounded-2xl animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenue chez Expertic
        </h1>
        
        <p className="text-gray-600 mb-6">
          Redirection vers la page de connexion...
        </p>

        {/* Countdown Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  dot <= countdown 
                    ? "bg-blue-500 scale-110" 
                    : "bg-blue-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-100 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>

        {/* Status Text */}
        <p className="text-sm text-blue-600 font-medium">
          {countdown > 0 
            ? `Redirection dans ${countdown} seconde${countdown > 1 ? 's' : ''}...` 
            : "Redirection en cours..."}
        </p>
      </div>
    </div>
  );
}