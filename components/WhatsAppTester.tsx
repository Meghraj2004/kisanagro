'use client';

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppTester() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const businessPhone = '7249261176';
  
  const testFormats = [
    { name: 'Format 1 (91 + number)', url: `https://wa.me/91${businessPhone}`, message: 'Hello from KisanAgro website!' },
    { name: 'Format 2 (direct number)', url: `https://wa.me/${businessPhone}`, message: 'Hello from KisanAgro website!' },
    { name: 'Format 3 (+91 + number)', url: `https://wa.me/+91${businessPhone}`, message: 'Hello from KisanAgro website!' },
    { name: 'Format 4 (simple message)', url: `https://wa.me/91${businessPhone}`, message: 'Hi!' },
    { name: 'Format 5 (no message)', url: `https://wa.me/91${businessPhone}`, message: '' }
  ];

  const testWhatsAppFormat = (format: any) => {
    const { name, url, message } = format;
    const fullUrl = message ? `${url}?text=${encodeURIComponent(message)}` : url;
    
    console.log(`Testing ${name}: ${fullUrl}`);
    setTestResults(prev => [...prev, `Testing ${name}: ${fullUrl}`]);
    
    // Open WhatsApp
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">WhatsApp Business Tester</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Business Number: {businessPhone}<br/>
        Test different formats to see which works best
      </p>
      
      <div className="space-y-2">
        {testFormats.map((format, index) => (
          <button
            key={index}
            onClick={() => testWhatsAppFormat(format)}
            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <FaWhatsapp className="w-4 h-4" />
            {format.name}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-sm">Click buttons above to test</p>
          ) : (
            testResults.map((result, index) => (
              <p key={index} className="text-xs mb-1 font-mono">{result}</p>
            ))
          )}
        </div>
        <button 
          onClick={() => setTestResults([])}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Clear Results
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <strong>Instructions:</strong>
        <br />1. Test each format
        <br />2. Check which one opens WhatsApp correctly
        <br />3. Verify if the message appears pre-filled
        <br />4. Use the working format for your business
      </div>
    </div>
  );
}