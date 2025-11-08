
import { FiAward, FiUsers, FiTruck, FiShield } from 'react-icons/fi';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'About KisanAgro - Leading Fruit Foam Net Manufacturer in India',
  description: 'Learn about KisanAgro, India\'s trusted manufacturer of premium fruit foam nets and agricultural packaging solutions. Our journey, mission, and commitment to quality fruit protection.',
  keywords: [
    'about kisanagro',
    'fruit foam net manufacturer company',
    'agricultural packaging company India',
    'fruit protection solutions provider',
    'EPE foam manufacturer about us',
    'company profile fruit nets',
    'manufacturing facility India',
    'quality assurance fruit packaging'
  ],
  path: '/about'
});

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container">
          <h1 className="heading-lg text-center text-gray-900 mb-4">
            About KisanAgro
          </h1>
          <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto">
            Your Trusted Partner in Agriculture Packaging Solutions
          </p>
        </div>
      </section>

      {/* Company Info */}
      <section className="container section-padding">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-md text-gray-900 mb-6">Who We Are</h2>
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              KisanAgro is a leading manufacturer and supplier of premium-quality agriculture fruit foam nets 
              and protective packaging solutions. With years of experience in the industry, we understand the 
              critical importance of protecting agricultural produce during transport and storage.
            </p>
            <p>
              Our fruit foam nets are designed to provide maximum protection while being lightweight, durable, 
              and cost-effective. We serve farmers, traders, exporters, and distributors across India, helping 
              them reduce post-harvest losses and maintain product quality.
            </p>
            <p>
              At KisanAgro, quality is our top priority. We use high-grade EPE (Expanded Polyethylene) foam 
              materials that are tested for durability, water resistance, and shock absorption. Our products 
              meet international standards and are trusted by businesses nationwide.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 text-white section-padding">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '1+', label: 'Years Experience' },
              { number: '250+', label: 'Happy Clients' },
              { number: '10K+', label: 'Products Delivered' },
              { number: '100%', label: 'Quality Guarantee' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container section-padding">
        <h2 className="heading-md text-center text-gray-900 mb-12">
          Why Choose KisanAgro?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: FiShield,
              title: 'Premium Quality',
              description: 'High-grade EPE foam materials tested for durability and protection',
            },
            {
              icon: FiAward,
              title: 'Industry Expertise',
              description: 'Years of experience serving the agricultural packaging sector',
            },
            {
              icon: FiTruck,
              title: 'Fast Delivery',
              description: 'Reliable and timely delivery across India',
            },
            {
              icon: FiUsers,
              title: 'Customer Support',
              description: '24/7 support team ready to assist you',
            },
          ].map((feature, index) => (
            <div key={index} className="card p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 section-padding">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="card p-8">
              <h3 className="text-2xl font-bold text-primary-600 mb-4">Our Mission</h3>
              <p className="text-gray-700">
                To provide innovative, high-quality protective packaging solutions that help farmers and 
                businesses reduce post-harvest losses, maintain product quality, and increase profitability.
              </p>
            </div>
            <div className="card p-8">
              <h3 className="text-2xl font-bold text-primary-600 mb-4">Our Vision</h3>
              <p className="text-gray-700">
                To become India's most trusted brand in agricultural packaging, known for quality, innovation, 
                and customer satisfaction, while contributing to sustainable agricultural practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container section-padding text-center">
        <h2 className="heading-md text-gray-900 mb-4">
          Ready to Partner With Us?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Get in touch today to discuss your packaging needs
        </p>
        <a href="/contact" className="btn btn-primary">
          Contact Us
        </a>
      </section>
    </>
  );
}
