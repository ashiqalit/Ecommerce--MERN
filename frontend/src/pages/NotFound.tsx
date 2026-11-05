import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link
        to="/"
        className="mt-4 inline-block text-indigo-600 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
