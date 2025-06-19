import React, { useState } from 'react';
import './News.css';
import newsData from './newsData';

function News() {
  const categories = Object.keys(newsData);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const handleArticleClick = (article) => {
    const viewed = JSON.parse(localStorage.getItem('viewedNews')) || [];
    const isDuplicate = viewed.some((item) => item.link === article.link);
    if (!isDuplicate) {
      viewed.push(article);
      localStorage.setItem('viewedNews', JSON.stringify(viewed));
    }
  };

  return (
    <div className="news-page px-6 py-10 bg-blue-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📰 Tin Tức Y Tế</h2>
      <div className="news-tabs flex gap-4 flex-wrap justify-center mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full border transition font-medium ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="news-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsData[activeCategory].map((article, idx) => (
          <div key={idx} className="news-card rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleArticleClick(article)}
              className="block"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-gray-800 hover:text-blue-600">
                  {article.title}
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;