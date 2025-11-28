interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="w-full max-w-sm mx-auto text-center py-12">
      <div className="text-6xl mb-4">😓</div>
      <p className="text-xl text-gray-700 font-semibold">{message}</p>
    </div>
  );
}

