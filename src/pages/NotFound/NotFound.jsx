import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <h1 className="text-5xl font-bold">404</h1>
    <p className="text-gray-500">Page not found</p>
    <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
  </div>
);
export default NotFound;
