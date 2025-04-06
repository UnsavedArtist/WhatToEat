import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className={`relative shadow-lg ${inter.className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("/images/navbar.jpg")' }}
      />
      
      <div className="container mx-auto px-6 relative z-20">
        <div className="flex justify-between items-center h-20">
          {/* Left-aligned logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/w2e.png"
              alt="What To Eat Logo"
              width={68}
              height={68}
              className="rounded-md shadow-lg"
              priority
              quality={100}
              unoptimized
            />
          </Link>

          <div className="flex items-center space-x-3">
            <Link 
              href="/map" 
              className="px-6 py-2.5 rounded-full bg-black/60 text-white border border-white/20 
                         hover:bg-black/90 transition-all duration-200 tracking-tight text-sm font-medium
                         shadow-sm hover:shadow-md"
            >
              Find Restaurants
            </Link>
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className="px-6 py-2.5 rounded-full bg-black/60 text-white border border-white/20 
                             hover:bg-black/90 transition-all duration-200 tracking-tight text-sm font-medium
                             shadow-sm hover:shadow-md"
                >
                  <FaUser className="inline-block mr-1.5" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-6 py-2.5 rounded-full bg-red-500/90 text-white border border-red-400/20 
                           hover:bg-red-600/90 transition-all duration-200 tracking-tight text-sm font-medium
                           shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="px-6 py-2.5 rounded-full bg-blue-500/90 text-white border border-blue-400/20 
                         hover:bg-blue-600/90 transition-all duration-200 tracking-tight text-sm font-medium
                         shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Bottom shadow/separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
    </nav>
  );
};

export default Navbar; 