export default function AdminLeadsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Lead Management
        </h1>
        <p className="text-gray-600">
          View and manage RMA leads from the Australian Migration Hub
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            You've successfully logged in to the RMA Dashboard. The Lead Inbox
            will be built in Session 2.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <p className="text-sm text-green-800 font-medium mb-2">
              Session 1 Complete
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Login page working</li>
              <li>• Authentication system active</li>
              <li>• Route protection enabled</li>
              <li>• Session cookies functioning</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Next: Build Lead Inbox table view in Session 2
          </p>
        </div>
      </div>
    </div>
  )
}
