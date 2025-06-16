import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        📜 Anonymess – Community & Legal Use Policy
      </h1>
      
      <div className="text-gray-600 dark:text-gray-400 space-y-6">
        <p className="italic">Effective Date: [date goes here]</p>
        
        <p>
          Anonymess is a fully anonymous platform designed to let people freely express their thoughts and emotions without judgment. 
          While we stand for privacy and freedom of expression, we are committed to maintaining the safety, legality, and ethical use of this platform.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. 🚨 Compliance with Law</h2>
          <p>We strictly adhere to all applicable laws and regulations. We are obliged to cooperate with government authorities in any matter related to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>National security threats</li>
            <li>Terrorism</li>
            <li>Kidnapping or murder investigations</li>
            <li>Public safety concerns</li>
          </ul>
          
          <p className="mt-3">We reserve the right to take down content and share relevant data with lawful authorities if your use of Anonymess is reasonably suspected to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Encourage or promote violence</li>
            <li>Plan or coordinate criminal activity</li>
            <li>Threaten individuals or communities</li>
            <li>Endanger national or public security</li>
          </ul>
          
          <p className="mt-3 font-medium">⚠ Although we do not collect user identity or login information, we reserve the right to monitor patterns and metadata (like IP, message content, etc.) where necessary to protect against abuse of the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. ❌ Prohibited Use</h2>
          <p>You may not use Anonymess to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Share or promote terrorism, violence, or hate speech</li>
            <li>Harass, stalk, or threaten anyone</li>
            <li>Spread false information with the intent to cause harm</li>
            <li>Discuss or coordinate illegal activities (e.g., murder, kidnapping)</li>
            <li>Endanger minors or exploit vulnerable groups</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. 🛡 Your Responsibility</h2>
          <p>Even though Anonymess is anonymous, users are still responsible for what they post. By using this platform, you agree not to exploit its anonymity for harmful purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. 🧾 Final Note</h2>
          <p>We believe in freedom of expression, but not at the cost of someone's life, safety, or peace. Use Anonymess to be real — not reckless.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 