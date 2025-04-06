import Link from 'next/link';
import Image from 'next/image';
import { FaUtensils, FaMapMarkedAlt, FaStar } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/Final2.png"
            alt="What To Eat Logo"
            width={250}
            height={250}
            priority
            quality={100}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Discover Your Next Favorite Restaurant
        </h1>
        <p className="text-xl text-white mb-8">
          Let us help you find the perfect place to eat based on your preferences
        </p>
        <Link
          href="/map"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
        >
          Find Restaurants
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaMapMarkedAlt className="text-4xl text-blue-500" />}
              title="Find Nearby Places"
              description="Discover restaurants in your area that match your preferences"
            />
            <FeatureCard
              icon={<FaUtensils className="text-4xl text-blue-500" />}
              title="Personalized Recommendations"
              description="Get suggestions based on your taste profile and dietary preferences"
            />
            <FeatureCard
              icon={<FaStar className="text-4xl text-blue-500" />}
              title="Rate and Review"
              description="Share your experiences and help others find great places to eat"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
