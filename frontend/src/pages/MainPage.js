import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, Instagram, Facebook, Calendar } from 'lucide-react'
import DynamicIcon from './componens/DynamicIcon';
import config from '../config.json';


const TabsList = ({ children, className = '' }) => (
  <div className={`flex rounded-lg bg-black/20 p-1 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, isActive, onClick }) => (
  <button
    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
      ${isActive 
        ? 'bg-red-500 text-white shadow-sm' 
        : 'text-gray-400 hover:text-white hover:bg-black/20'}`}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab }) => (
  <div className={`${value === activeTab ? 'block' : 'hidden'}`}>
    {children}
  </div>
);


export default function MainPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeTab, setActiveTab] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [aboutUs, setAboutUs] = useState([]);
  const [events, setEvents] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [galeries, setGaleries] = useState([]);
  const [showsDetails, setShowsDetails] = useState([]);
  const [showsSummary, setShowsSummary] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const contentRefs = useRef([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [selectedHero, setSelectedHero] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });


  const fetchData = () => {
    const { baseURL } = config;

    return Promise.all([
      fetch(`${baseURL}/api/about-uses`).then((res) => res.json()),
      fetch(`${baseURL}/api/events`).then((res) => res.json()),
      fetch(`${baseURL}/api/faqs`).then((res) => res.json()),
      fetch(`${baseURL}/api/galeries?populate=*`).then((res) => res.json()),
      fetch(`${baseURL}/api/shows-details?populate=*`).then((res) => res.json()),
      fetch(`${baseURL}/api/shows-modals`).then((res) => res.json()),
      fetch(`${baseURL}/api/hero-images?populate=*`).then((res) => res.json())
    ])
    .then(([aboutUsData,eventsData,faqsData,galeriesData, showsDetailsData, showsSummaryData,heroImagesData]) => {
      setAboutUs(aboutUsData.data);
      setEvents(eventsData.data);
      setFaqs(faqsData.data);
      setGaleries(galeriesData.data);
      setShowsDetails(showsDetailsData.data);
      if (showsDetailsData.data.length > 0) {
        setActiveTab(showsDetailsData.data[0].id);
      }
      setShowsSummary(showsSummaryData.data);
      setHeroImages(heroImagesData.data);
    })
    .catch((error) => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchData();

    const handleScroll = () => {
      const sections = ['home', 'about', 'performances', 'gallery', 'contact', 'hero'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const openModalEvent = (event) => setSelectedEvent(event);
  const closeModalEvent = () => setSelectedEvent(null);

  const openModalImage = (imageUrl, description) => {
    setSelectedImage(imageUrl);
    setSelectedDescription(description);
  };

  const closeModalImage = () => {
    setSelectedImage(null);
    setSelectedDescription('');
  };

  const openHeroModal = (hero) => {
    setSelectedHero(hero);
  };

  const closeHeroModal = () => {
    setSelectedHero(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Jméno je povinné';
    if (!formData.email.trim()) return 'Email je povinný';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Neplatný email';
    if (!formData.message.trim()) return 'Zpráva je povinná';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        error
      });
      return;
    }

    setFormStatus({
      isSubmitting: true,
      isSuccess: false,
      error: null
    });

    try {
      const response = await fetch(`${config.baseURL}/api/contact-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Jmeno: formData.name,
            Email: formData.email,
            Zprava: formData.message
          }
        })
      });

      if (!response.ok) {
        throw new Error('Něco se pokazilo. Zkuste to prosím později.');
      }

      setFormStatus({
        isSubmitting: false,
        isSuccess: true,
        error: null
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({
          ...prev,
          isSuccess: false
        }));
      }, 5000);

    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        error: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed w-full z-50 bg-black/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-500">Aure Nox</h1>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {[
                ['home', 'Úvod'],
                ['about', 'O nás'],
                ['performances', 'Vystoupení'],
                ['hero', 'Účinkující'],
                ['gallery', 'Galerie'],
                ['contact', 'Kontakt']
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={`capitalize hover:text-red-500 transition-colors ${
                      activeSection === id ? 'text-red-500' : ''
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 flex items-center justify-center">
          <nav>
            <ul className="flex flex-col space-y-6 text-center">
              {[
                ['home', 'Úvod'],
                ['about', 'O nás'],
                ['performances', 'Vystoupení'],
                ['hero', 'Účinkující'],
                ['gallery', 'Galerie'],
                ['contact', 'Kontakt']
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="text-2xl capitalize hover:text-red-500 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={'/images/o1.jpg'} 
            alt="Aure Nox Logo" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">Aure Nox</h2>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up animation-delay-300 leading-relaxed">
            Nové jméno, známé tváře. Přinášíme vám jedinečnou kombinaci umění, ohně a světla.
          </p>
          <button
            onClick={() => scrollTo('contact')}
            className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors animate-fade-in-up animation-delay-600 text-lg"
          >
            Rezervujte si vystoupení
          </button>
        </div>
        <button
          onClick={() => scrollTo('about')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </section>



    
      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-black to-black">
        <div className="container mx-auto px-4">
          {aboutUs.map((item,index) => (
            <>
            <h2 className="text-4xl font-bold mb-12 text-center">{item.Nazev}</h2>
            <div key={index} className="max-w-4xl mx-auto text-center space-y-8">
              <p className="text-lg text-gray-300 leading-relaxed">
              {item.Obsah}
              </p>
            </div>
          </>
          ))}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            {showsSummary.map((item, index) => (
              <div key={index} className="bg-black/50 backdrop-blur-sm border border-red-900/30 rounded-xl p-8 hover:border-red-500/50 transition-all duration-300">
                <div className="text-center">
                  <DynamicIcon iconName={item.Ikona} size={45} color='red'/>
                  <h3 className="text-2xl font-semibold mb-4">{item.Titulek}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.Popis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performances Section */}
      <section id="performances" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Naše vystoupení</h2>
          
          <TabsList className="mb-8">
          {showsDetails.map(show => (
            <TabsTrigger
              key={show.id}
              value={show.id}
              isActive={activeTab === show.id}
              onClick={setActiveTab} 
            >
              {show.Titulek}
            </TabsTrigger>
          ))}
        </TabsList>

          {showsDetails.map((show) => (
            <TabsContent key={show.id} value={show.id} activeTab={activeTab}>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-3xl font-semibold mb-4">{show.Titulek}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{show.Popis}</p>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={`${config.baseURL}${show.Obrazek.url}`}
                    alt={`${show.Titulek}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-gradient-to-b from-black to-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-white">Nadcházející akce</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={index}
                onClick={() => openModalEvent(event)}
                className="bg-black bg-opacity-50 backdrop-blur-lg border border-red-500 rounded-lg transform hover:scale-105 transition duration-500 cursor-pointer"
              >
                <div className="p-6">
                  <div className="text-white text-2xl mb-4"><Calendar /></div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">{event.Nazev}</h3>
                  <p className="text-gray-300 mb-2">{event.Datum}</p>
                  <p className="text-gray-400">{event.Misto}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-gray-900 border border-red-500 p-6 rounded-lg max-w-md mx-4">
                <h3 className="text-3xl font-semibold text-white mb-4">{selectedEvent.Nazev}</h3>
                <p className="text-gray-300 mb-2">{selectedEvent.Datum}</p>
                <p className="text-gray-300 mb-4">{selectedEvent.Misto}</p>
                <p className="text-gray-400">{selectedEvent.Popis}</p>
                <button
                  onClick={closeModalEvent}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Zavřít
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* F&A Section */}
      <section id="faq" className="py-20 bg-gradient-to-b from-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">Často kladené otázky</h2>
        <div className="max-w-2xl mx-auto">
          {faqs.map((item, index) => (
            <div key={index} className="mb-4 border-b border-gray-500">
              <button 
                className="w-full text-left bg-transparent border-none text-white font-semibold py-4 transition-colors duration-300 hover:text-red-400"
                onClick={() => toggleAccordion(index)}
              >
                {item.Otazka}
              </button>
              <div 
                ref={el => contentRefs.current[index] = el}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-screen' : 'max-h-0'}`}
                style={{ maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight}px` : '0px' }}
              >
                <div className="p-4 text-gray-300 border-l-4 border-red-500">
                  {item.Odpoved}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

     {/* Hero Section */}
     <section id="hero" className="py-20 bg-black scroll-mt-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">
          Účinkující
        </h2>
        
        {/* Circular images container */}
        <div className="relative w-full max-w-5xl mx-auto mb-12">
          <div className="flex justify-center items-center gap-4 md:gap-8">
            {heroImages.map((hero, index) => (
              <div 
                key={hero.id}
                onClick={() => openHeroModal(hero)}
                className={`relative overflow-hidden border-4 border-red-500/30 transform hover:scale-105 transition-transform duration-300 rounded-full cursor-pointer
                  ${index === 1 ? 'w-56 h-56 md:w-80 md:h-80 z-10' : 'w-48 h-48 md:w-72 md:h-72'}
                `}
              >
                <img 
                  src={`${config.baseURL}${hero.Obrazek.url}`}
                  alt={hero.Popis || `Performer ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                  <span className="text-white text-lg font-medium">
                    {hero.Jmeno}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedHero && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeHeroModal}
          >
            <div 
              className="relative max-w-4xl w-full bg-black rounded-xl shadow-2xl border border-red-500/50"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeHeroModal}
                className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors duration-300"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={`${config.baseURL}${selectedHero.Obrazek.url}`}
                    alt={selectedHero.Jmeno}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white">
                    {selectedHero.Jmeno}
                  </h3>
                  
                  <div className="prose prose-invert">
                    <p className="text-gray-300">
                      {selectedHero.Popis}
                    </p>
                  </div>

                  {selectedHero.Role && (
                    <div className="pt-4">
                      <h4 className="text-lg font-semibold text-red-500 mb-2">
                        Role
                      </h4>
                      <p className="text-gray-300">
                        {selectedHero.Role}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>

    {/* Gallery Section */}
    <section id="gallery" className="py-16 bg-gradient-to-b from-black to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center text-white">
          Galerie
        </h2>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {galeries.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg hover:shadow-red-500/30 transition-all duration-300"
              onClick={() => openModalImage(`${config.baseURL}${image.Obrazek.url}`, image.Popis)}
            >
              {/* Image Container */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
              <img 
                src={`${config.baseURL}${image.Obrazek.url}`} 
                alt={`Aure Nox Galerie ${index}`}
                className="w-full h-full object-cover transition-transform duration-500" 
              />
              
              {/* Default Arrow Icon */}
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
                <span className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </span>
              </div>

              {/* Hover Magnify Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={closeModalImage}
          >
            <div 
              className="relative max-w-4xl w-full bg-black rounded-xl shadow-2xl border border-red-500/50"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeModalImage}
                className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors duration-300"
              >
                <svg 
                  className="w-8 h-8" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>

              <div className="p-4">
                <img
                  src={selectedImage} 
                  alt="Full-sized gallery item"
                  className="rounded-lg shadow-lg w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              </div>

              {selectedDescription && (
                <div className="p-4 border-t border-red-500/20">
                  <p className="text-white text-center">{selectedDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-black to-black">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-black/50 backdrop-blur-sm border border-indigo-900 rounded-xl p-6">
          <h3 className="text-2xl font-semibold mb-4">Spojte se s námi</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Vaše jméno"
              className="w-full p-2 rounded bg-black text-white border border-indigo-900 focus:border-red-500 outline-none"
              disabled={formStatus.isSubmitting}
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Váš email"
              className="w-full p-2 rounded bg-black text-white border border-indigo-900 focus:border-red-500 outline-none"
              disabled={formStatus.isSubmitting}
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Vaše zpráva"
              rows={4}
              className="w-full p-2 rounded bg-black text-white border border-indigo-900 focus:border-red-500 outline-none"
              disabled={formStatus.isSubmitting}
            ></textarea>
            
            {formStatus.error && (
              <div className="text-red-500 text-sm">
                {formStatus.error}
              </div>
            )}
            
            {formStatus.isSuccess && (
              <div className="text-green-500 text-sm">
                Zpráva byla úspěšně odeslána!
              </div>
            )}

            <button
              type="submit"
              disabled={formStatus.isSubmitting}
              className={`w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ${
                formStatus.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {formStatus.isSubmitting ? 'Odesílání...' : 'Odeslat zprávu'}
            </button>
          </form>
        </div>

            {/* Contact Information */}
            <div className="bg-black/50 backdrop-blur-sm border border-indigo-900 rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4">Kontaktní informace</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                {/* First Column */}
                <div>
                  <div className="font-semibold">Informace o spolku:</div>
                  <div>Aure Nox z.s.</div>
                  <div>IČ: 22000496</div>
                </div>

                {/* Second Column */}
                <div>
                    <div className="font-semibold">Adresa sídla:</div>
                    <div>Družstevní 302/34, 58901 Třešť</div>
                </div>

                {/* Third Column */}
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold">Web:</span>
                    <a href="https://www.aurenox.cz" className="ml-1 text-red-500 hover:underline">www.aurenox.cz</a>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold">Email:</span>
                    <a href="mailto:info@aurenox.cz" className="ml-1 text-red-500 hover:underline">info@aurenox.cz</a>
                  </div>
                </div>

                {/* Forth Column */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center">
                    <span className="font-semibold">Zakladatelé spolku:</span>
                    <ul className="ml-1">Zbyněk Skácel</ul>
                    <ul className="ml-1">Lucie Čudová</ul>
                    <ul className="ml-1">Hana Zeithamová</ul>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h4 className="text-xl font-semibold mb-4">Sledujte nás</h4>
                <div className="flex space-x-4">
                  <button className="p-2 border border-indigo-900 rounded-lg hover:bg-indigo-900/50 transition-colors">
                    <a href="https://www.facebook.com/aurenox" className="flex items-center">
                      <Facebook className="h-4 w-4" />
                    </a>
                  </button>
                  <button className="p-2 border border-indigo-900 rounded-lg hover:bg-indigo-900/50 transition-colors">
                    <a href="https://www.instagram.com/_aurenox" className="flex items-center">
                      <Instagram className="h-4 w-4" />
                    </a>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-red-500 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Aure Nox</p>
        </div>
      </footer>
    </div>
  )
}