import { Progress } from "@/components/ui/progress";

interface LoadingOverlayProps {
  show: boolean;
  progress?: number;
  message?: string;
}

export const LoadingOverlay = ({ show, progress = 0, message = "Processing..." }: LoadingOverlayProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-center">{message}</h3>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">{progress}% Complete</p>
        </div>
      </div>
    </div>
  );
};