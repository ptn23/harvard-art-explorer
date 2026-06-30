import { useState } from 'react'
import './App.css'

function App() {
  const API_KEY = 'c48844de-9f8c-4d19-9359-29587525bb31';
  const [currentArt, setCurrentArt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [banList, setBanList] = useState({
    'century': [],
    'culture': [],
    'medium': []
  })

  const fetchRandomArt = async() => {
    setLoading(true);
    setError(null);
    try{
      const randomPage = Math.floor(Math.random() * 500) + 1
      const url = `https://api.harvardartmuseums.org/object?apikey=${API_KEY}&hasimage=1&size=10&page=${randomPage}&sort=random`;

      const response = await fetch(url);

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (!data.records || data.records.length === 0) {
        throw new Error('No artwork found, trying again');
      }
      const validArtwork = data.records.find(art => {
        const culture = art.culture || 'Unknown Culture';
        const century = art.century || 'Unknown Century';
        const medium = art.medium || 'Unknown Medium';
        const hasPrimaryImage = art.primaryimageurl;

        const isCultureBanned = banList.culture.includes(culture);
        const isCenturyBanned = banList.century.includes(century);
        const isMediumBanned = banList.medium.includes(medium);

        return hasPrimaryImage && !isCultureBanned && !isCenturyBanned && !isMediumBanned;
      });
      if (validArtwork){
        setCurrentArt({
          title: validArtwork.title,
          image: validArtwork.primaryimageurl,
          culture: validArtwork.culture || 'Unknown Culture',
          century: validArtwork.century || 'Unknown Century',
          medium: validArtwork.medium || 'Unknown Medium'
          
        })
      }
      else{
        fetchRandomArt();
      }
    }
    catch (err){
      setError(err.message);
    } finally{
      setLoading(false);
    }
  }

  const toggleBan = (category, value) => {
    if (value === 'Unknown Culture' || value === 'Unknown Century' || value === 'Unknown Medium') return;
    setBanList(prev => {
      const isBanned = prev[category].includes(value);
      return {
        ...prev,
        [category]: isBanned ? prev[category].filter(item => item !== value) : [...prev[category], value]
      }
    })
  }
  const isCurrentlyBanned = (category, value) => banList[category].includes(value);
  const hasBannedItems = Object.values(banList).some(arr => arr.length > 0);

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between items-center min-h-[500px]">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery Explorer</h2>
        
        {loading && <p className="text-blue-500 font-semibold animate-pulse my-auto">Searching the archives...</p>}
        {error && !loading && <p className="text-red-500 my-auto">Error: {error}</p>}

        {!loading && currentArt && (
          <div className="w-full flex flex-col items-center">
            <img 
              src={currentArt.image} 
              alt={currentArt.title} 
              className="max-h-72 object-contain rounded-md shadow-md mb-4 bg-gray-50"
            />
            <h3 className="text-lg font-semibold italic text-center mb-4 text-gray-700">{currentArt.title}</h3>
            
            <div className="w-full space-y-2">
              <button 
                onClick={() => toggleBan('culture', currentArt.culture)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors group flex justify-between"
              >
                <span><strong>Culture:</strong> {currentArt.culture}</span>
                <span className="text-xs text-gray-400 group-hover:text-red-500 italic"></span>
              </button>

              <button 
                onClick={() => toggleBan('century', currentArt.century)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors group flex justify-between"
              >
                <span><strong>Century:</strong> {currentArt.century}</span>
                <span className="text-xs text-gray-400 group-hover:text-red-500 italic"></span>
              </button>

              <button 
                onClick={() => toggleBan('medium', currentArt.medium)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-colors group flex justify-between"
              >
                <span><strong>Medium:</strong> {currentArt.medium}</span>
                <span className="text-xs text-gray-400 group-hover:text-red-500 italic"></span>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={fetchRandomArt} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:bg-indigo-300"
        >
          {loading ? 'Fetching...' : ' Discover New Artwork'}
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Ban List</h3>
        {!hasBannedItems ? (
          <p className="text-sm text-gray-500 italic">No attributes are banned yet. Click attributes on the left to restrict certain historical styles!</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(banList).map((category) => (
              banList[category].length > 0 && (
                <div key={category}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {banList[category].map((value) => (
                      <button
                        key={value}
                        onClick={() => toggleBan(category, value)}
                        className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center hover:bg-red-200 transition-colors"
                        title="Click to remove from ban list"
                      >
                        {value} <span className="ml-2 font-bold"></span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App
