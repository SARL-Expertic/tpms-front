// components/magic-loaders/card-skeleton.tsx
export const CardSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-purple-100 dark:border-gray-700 shadow-lg"
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                <div className="h-3 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};