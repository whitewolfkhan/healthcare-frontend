export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
      </div>
      <span className="text-gray-400 text-sm">{message}</span>
    </div>
  );
}
