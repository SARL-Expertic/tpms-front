// components/magic-loaders/table-skeleton.tsx
export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 
        dark:from-gray-800 dark:to-gray-900 rounded-t-lg border border-purple-100 dark:border-gray-700">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 
            dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="space-y-3">
        {[...Array(5)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-gray-800 
              rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm
              hover:shadow-md transition-shadow duration-200"
          >
            {[...Array(12)].map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-3 bg-gradient-to-r from-gray-100 to-gray-200 
                  dark:from-gray-700 dark:to-gray-600 rounded animate-pulse
                  ${colIndex % 3 === 0 ? 'w-3/4' : 'w-full'}`}
                style={{
                  animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};