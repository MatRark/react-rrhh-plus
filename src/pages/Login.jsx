
export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            {/* Aqui va el icono */}
            <span className="material-symbols-outlined text-4xl text-blue-600">
              apps
            </span>
          </div>
          <h1 className="text-2xl font-bold">HR System</h1>
          <p className="text-gray-500 text-sm">Welcome back, please sign in.</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
            type="text"
            placeholder="Enter your username"
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
            type="password"
            placeholder="Enter your password"
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          <div className="text-center">
            <a href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
);
}
