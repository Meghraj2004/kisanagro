'use client';

import { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { siteConfig } from '@/lib/config';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/utils';
import { generateLocalBusinessSchema } from '@/lib/metadata';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: sanitizeInput(formData.name),
          city: sanitizeInput(formData.city),
          message: sanitizeInput(formData.message),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', city: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container">
          <h1 className="heading-lg text-center text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto">
            Get in touch with us for inquiries, orders, or any questions
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="container section-padding">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="heading-md text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">
              We're here to help! Reach out to us through any of the following channels, 
              or fill out the form and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                  <a href={`tel:${siteConfig.phone}`} className="text-primary-600 hover:underline">
                    {siteConfig.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <a href={`mailto:${siteConfig.email}`} className="text-primary-600 hover:underline break-all">
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaWhatsapp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                  <a
                    href={`https://wa.me/${siteConfig.phone}?text=Hello, I would like to inquire about your products`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">{siteConfig.address}</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Business Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="heading-md text-gray-900 mb-6">Send Us a Message</h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  className="input"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending...' : (
                  <>
                    <FiSend className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="container pb-16">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d403.5440468823827!2d74.20234486160938!3d20.592537022781354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bde63f09324edfd%3A0xd3484e83fbc26903!2sChintamani%20Traders!5e0!3m2!1sen!2sin!4v1762277151155!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="KisanAgro Location"
          />
        </div>
      </section>
    </>
  );
}
