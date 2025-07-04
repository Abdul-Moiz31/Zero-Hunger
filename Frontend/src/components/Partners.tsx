import React from 'react';

const Partners = () => {
  const partners = [
    {
      category: 'Food Chains',
      logos: [
        { name: 'Restaurant A', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
        { name: 'Restaurant B', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
        { name: 'Restaurant C', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
      ]
    },
    {
      category: 'NGOs',
      logos: [
        { name: 'NGO A', url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
        { name: 'NGO B', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
        { name: 'NGO C', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
      ]
    }
  ];

  return (
    <section id="partners" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Working together with leading organizations to make a difference in our communities.
          </p>
        </div>

        <div className="space-y-16">
          {partners.map((category, index) => (
            <div key={index} className="animate-fadeInUp" style={{ animationDelay: `${index * 200}ms` }}>
              <h3 className="text-2xl font-semibold text-center mb-8">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.logos.map((partner, pIndex) => (
                  <div 
                    key={pIndex} 
                    className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  >
                    <img
                      src={partner.url}
                      alt={partner.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-food-image.jpg'; }}
                    />
                    <h4 className="text-xl font-semibold text-center">{partner.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-fadeInUp animate-delay-300">
          <h3 className="text-2xl font-semibold mb-6">Become a Partner</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our network of partners and help us create a sustainable food ecosystem that benefits everyone.
          </p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-green-700 hover:-translate-y-1 hover:shadow-lg">
            Partner With Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default Partners;