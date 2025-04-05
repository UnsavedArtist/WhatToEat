import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            What To Eat?
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/map" className="text-gray-600 hover:text-gray-800">
              Find Restaurants
            </Link>
            {session ? (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                  <FaUser className="inline-block mr-1" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 