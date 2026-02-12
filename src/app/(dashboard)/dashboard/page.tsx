export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to FieldOps HQ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Visits Finished (Today)</p>
          <h3 className="text-3xl font-bold text-gray-900">0/0</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Visits Finished (Week)</p>
          <h3 className="text-3xl font-bold text-gray-900">0/5</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Visits Finished (Month)</p>
          <h3 className="text-3xl font-bold text-gray-900">0/21</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Avg. Customer Rating</p>
          <h3 className="text-3xl font-bold text-gray-900">3.7</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reports Pending Approval
        </h2>
        <p className="text-sm text-gray-600">
          AI-prioritized reports needing immediate supervisor review
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reports Pending Approval
        </h2>
        <p className="text-sm text-gray-600">
          AI-prioritized reports needing immediate supervisor review
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reports Pending Approval
        </h2>
        <p className="text-sm text-gray-600">
          AI-prioritized reports needing immediate supervisor review
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Reports Pending Approval
        </h2>
        <p className="text-sm text-gray-600">
          AI-prioritized reports needing immediate supervisor review
        </p>
      </div>
      
    </div>
  );
}
