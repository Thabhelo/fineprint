export default function AuthPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">
          You need to log in to access this section. Please log in or create an account to continue.
        </p>
        <a 
          href="/login" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
