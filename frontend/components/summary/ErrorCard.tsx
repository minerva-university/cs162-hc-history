import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle as AlertCircleIcon } from "lucide-react"

export default function ErrorCard({ error, onReset }: { error: string; onReset: () => void }) {
  return (
    <Card className="mb-6 border-none shadow-lg bg-red-50 overflow-hidden">
      <CardHeader className="bg-red-500 text-white p-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4" />
          {error ? "Database Error" : "No Data Available"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-red-800 whitespace-pre-line">{error || "No data found with current filters."}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onReset} variant="outline" size="sm">
            Reset Filters
          </Button>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Troubleshooting:</strong> Follow setup steps in README to ensure backend is running.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
