import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    q: 'What is cancer?',
    a: 'It is a disorder where Cells divide without limitation & create pressure on neighbor tissue and produce chemicals which lead to death.',
    keywords: ['what is cancer', 'cancer', 'define cancer', 'cancer meaning', 'what is it'],
  },
  {
    q: 'Is cancer curable?',
    a: 'Although legally nobody can claim cure, there are numerous instances where people lived to their life after detection of cancer. Unfortunately the survival rate with Chemo/Radio therapy doesn\'t exceed single digit even with such an enormous amount of research and effort. Although many natural products have shown better than Chemo effect, due to lack of study as per FDA, none of them has been accepted as Standard Therapy. Thus non-commercial organisations like Universities, PG/PhD students and some traditional research scientists, or some small scale studies conducts research on natural products. Combining these research results provide enough evidence to prove their use to include them in cancer therapy.',
    keywords: ['curable', 'cure', 'can cancer be cured', 'survival', 'can it be cured', 'is it curable'],
  },
  {
    q: 'What is this treatment?',
    a: 'Standard therapy includes Surgery, Chemo/Radio therapy, as these have frequently proved to be a failure, it is essential to try other options. Other options include Ayurvedic Therapy, Herbal Therapy, Chinese Therapy, Homeopathy, Sidda/Unani, Acupuncture, Acupressure, Laetriele Therapy, Hyperbaric Oxy-therapy, Ketotherapy, Fasting, Yoga etc. Each of the above has its own advantages. Combining many of them has synergistic benefits. Herbal Chemotherapy (HCT) is a combination of many of the above systems and diet change, life style change and exercise. Objective of HCT is to use all options to provide relief of signs, symptoms, and pain to the patient.',
    keywords: ['treatment', 'what is this treatment', 'hct', 'herbal chemotherapy', 'therapy options', 'ayurvedic', 'herbal therapy', 'what therapy', 'which therapy'],
  },
  {
    q: 'Is it safe?',
    a: 'All ingredients are natural and proved to be safe. Most of them are routinely used in Kitchen like Turmeric, Ginger, Tea, Grapes etc.',
    keywords: ['safe', 'safety', 'is it safe', 'side effects', 'harmful', 'danger', 'risk', 'natural'],
  },
  {
    q: 'Is this therapy approved?',
    a: 'These nutraceutical food supplements (Withaferins, EGCG, Curcumin C3 complex, Gingerols etc.) are derived from FSSAI-approved food-grade herbs and plants. They are legally classified as dietary supplements or functional foods under Indian food safety regulations. They are not drugs and do not require drug approval. Each ingredient is sourced and manufactured under quality-controlled conditions and complies with FSSAI food supplement guidelines.',
    keywords: ['approved', 'is this approved', 'is therapy approved', 'legal', 'certified', 'fssai', 'regulated', 'license', 'licence', 'government approved', 'authorized', 'authorised', 'permitted'],
  },
  {
    q: 'Should I visit in person?',
    a: 'In-person visits are not mandatory. We provide complete online consultations via WhatsApp and video call. You can share your medical reports, scans, and blood tests digitally. Prof. Ramesh Babu and our team will review your case and design a personalized nutraceutical supplement protocol that is shipped directly to your home anywhere in India. However, if you are based near our center and prefer a face-to-face review, you are most welcome to visit by scheduling a prior appointment.',
    keywords: ['visit', 'should i visit', 'come in person', 'in person', 'physically visit', 'walk in', 'meet in person', 'offline', 'can i visit', 'do i need to visit', 'need to come', 'come to clinic', 'personally visit'],
  },
  {
    q: 'Can HCT be used during Chemo Therapy & Radio Therapy (CTRT)?',
    a: 'Absolutely yes, you can use HC during CTRT. As HC makes cancer cells more vulnerable to chemo, you would get results better than Chemo alone. HC also provides protection against CTRT induced adverse reactions. As many ingredients like Ashwagandha, Tulsi are adaptogenic, they would reduce your hospital stay, ICU stay, infections, pain during Surgery and CTRT.',
    keywords: ['chemo', 'radio', 'ctrt', 'chemotherapy', 'radiation', 'alongside', 'during chemo', 'with chemo', 'with chemotherapy', 'together with'],
  },
  {
    q: 'How long do we need to take this treatment?',
    a: 'There is no standard duration for a particular type of Cancer. As soon as signs disappear you can stop. As it is nutrition, you have the freedom to start or stop any time. General duration in initial stages may be 1-3 months.',
    keywords: ['how long', 'duration', 'how many months', 'time period', 'stop treatment', 'long term', 'short term'],
  },
  {
    q: 'How much does it cost per month?',
    a: 'Each patient is presented with different health conditions. Based on several tests, the therapy is personalised to suit their requirements. Please enquire about this during the review & counseling time of your case.',
    keywords: ['cost', 'price', 'per month', 'how much', 'expensive', 'affordable', 'charges', 'fees', 'rate', 'monthly'],
  },
  {
    q: 'What would be the cost of whole treatment?',
    a: 'It would be fraction of the Chemo/Radio therapy. A PETCT scan cost would cover the therapy for several months. As there is no standard format of duration for each type of cancer, it is not possible to calculate accurately.',
    keywords: ['total cost', 'whole treatment cost', 'complete cost', 'overall cost', 'full treatment', 'total price'],
  },
  {
    q: 'How much time is required to procure therapy?',
    a: 'In most cases formulations would be readily available for patients. In few cases special formulations would have to be prepared which would require a day or two. Prior information would reduce the delay.',
    keywords: ['procure', 'time to get', 'delivery', 'ready', 'available', 'preparation time', 'how soon', 'ship', 'shipping'],
  },
  {
    q: 'Is everyone eligible for Herbal Chemotherapy?',
    a: 'Yes, everyone is eligible for Herbal Chemotherapy. Since it utilizes safe, non-toxic, and premium standardized botanical extracts tailored to each patient\'s specific pathology and organ filtration capacity, it is suitable for individuals of all ages and health conditions.',
    keywords: ['eligible', 'eligibility', 'everyone eligible', 'who is eligible', 'can i take', 'am i eligible'],
  },
  {
    q: 'Is there a recovery time required for Herbal Chemotherapy?',
    a: 'No recovery time is required as there are no serious side effects from Herbal Chemotherapy. Unlike conventional cytotoxic chemotherapy, HCT is gentle on the body and does not cause systemic toxicity, hair loss, or organ strain, allowing patients to maintain their daily routine.',
    keywords: ['recovery', 'recovery time', 'side effects', 'serious side effects', 'adverse effects', 'hair loss'],
  },
  {
    q: 'Is preparation required before starting Herbal Chemotherapy?',
    a: 'No preparation is required. You can start Herbal Chemotherapy at the earliest. Our team only requires a review of your recent blood panels, diagnostic scans, and current conventional medication list to screen for interactions and personalize your formula.',
    keywords: ['preparation', 'prepare', 'what preparation', 'start chemotherapy', 'how to start', 'getting started', 'begin'],
  },
  {
    q: 'Are all types of cancers eligible for Herbal Chemotherapy?',
    a: 'Yes, all types of cancers are eligible for Herbal Chemotherapy. Our protocols are customized to address various malignancies, including breast, lung, colon, prostate, liver, blood, and rare or advanced stage cancers, supporting the body\'s healing response.',
    keywords: ['all cancers', 'all type', 'every cancer', 'types of cancer', 'breast cancer', 'lung cancer', 'prostate', 'liver cancer', 'colon cancer'],
  },
  {
    q: 'What are the key differences between HCT and conventional therapies?',
    a: 'There is an ocean of differences. Few key comparisons:\na. HCT works on non-dividing cancer cells.\nb. HCT works on metastasized cancer cells too.\nc. HCT works on CCC (Circulating Cancer Cells) too.\nd. HCT works on CSC (Cancer Stem Cells) too.\nFor complete differences, please visit the last page of our English yellow brochure.',
    keywords: ['ocean', 'differences', 'comparison', 'non-dividing', 'metastasised', 'ccc', 'csc', 'brochure', 'difference between', 'compare'],
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your virtual assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([
    { id: 'faq', label: 'Frequently Asked Questions' },
    { id: 'about', label: 'Understand Cancer Herbalist' },
    { id: 'appointment', label: 'Book an Appointment' }
  ]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, options]);

  const handleOptionClick = (optionId) => {
    let botResponse = '';
    let newOptions = [];

    if (optionId === 'faq') {
      botResponse = 'Here are some of our most frequently asked questions. Please select one:';
      newOptions = faqs.map((faq, index) => ({ id: `faq_${index}`, label: faq.q }));
    } else if (optionId === 'about') {
      botResponse = 'Cancer Herbalist is a specialized clinic offering personalized, evidence-based phytotherapy protocols designed to support cancer patients. Our formulations are tailored to your specific pathology and work alongside conventional treatments to improve outcomes and quality of life.';
      newOptions = [
        { id: 'appointment', label: 'Book an Appointment' },
        { id: 'start', label: 'Back to main menu' }
      ];
    } else if (optionId === 'appointment') {
      botResponse = 'We would be honored to assist you. You can book an appointment by visiting our Contact page and filling out the consultation form.';
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: botResponse, sender: 'bot' },
        { id: Date.now() + 2, type: 'action', text: 'Go to Contact Page', action: () => { navigate('/contact'); setIsOpen(false); }, sender: 'bot' }
      ]);
      setOptions([{ id: 'start', label: 'Back to main menu' }]);
      return;
    } else if (optionId.startsWith('faq_')) {
      const index = parseInt(optionId.split('_')[1]);
      botResponse = faqs[index].a;
      newOptions = [
        { id: 'faq', label: 'More Questions' },
        { id: 'start', label: 'Back to main menu' }
      ];
    } else if (optionId === 'start') {
      botResponse = 'How else can I assist you?';
      newOptions = [
        { id: 'faq', label: 'Frequently Asked Questions' },
        { id: 'about', label: 'Understand Cancer Herbalist' },
        { id: 'appointment', label: 'Book an Appointment' }
      ];
    }

    setMessages(prev => [...prev, { id: Date.now(), text: botResponse, sender: 'bot' }]);
    setOptions(newOptions);
  };

  // Smart FAQ matching — scores each FAQ by how many keywords match the user's input
  const findMatchingFaq = (text) => {
    const lowerText = text.toLowerCase();
    let bestMatch = -1;
    let bestScore = 0;

    // Pass 1: phrase-level matching (longer phrases score higher)
    faqs.forEach((faq, index) => {
      let score = 0;
      faq.keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += keyword.split(' ').length * 2; // longer keyword matches score higher
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = index;
      }
    });

    if (bestScore > 0) return bestMatch;

    // Pass 2: individual word matching fallback (catches partial questions)
    const words = lowerText.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    faqs.forEach((faq, index) => {
      let score = 0;
      const allKeywordText = faq.keywords.join(' ').toLowerCase();
      words.forEach(word => {
        if (allKeywordText.includes(word)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = index;
      }
    });

    return bestScore >= 2 ? bestMatch : -1;
  };

  const handleUserMessage = (text) => {
    const userMessage = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const lowerText = text.toLowerCase();

    // Check for navigation intents first
    if (lowerText.includes('faq') || lowerText.includes('all question')) {
      setTimeout(() => handleOptionClick('faq'), 600);
      return;
    }
    if (lowerText.includes('about') || lowerText.includes('who are you') || lowerText.includes('understand')) {
      setTimeout(() => handleOptionClick('about'), 600);
      return;
    }
    if (lowerText.includes('book') || lowerText.includes('appointment') || lowerText.includes('consultation') || lowerText.includes('contact')) {
      setTimeout(() => handleOptionClick('appointment'), 600);
      return;
    }

    // Try to match a specific FAQ using keyword scoring
    const matchedIndex = findMatchingFaq(text);
    if (matchedIndex !== -1) {
      const botTypingId = Date.now() + 1;
      setMessages(prev => [...prev, { id: botTypingId, text: 'Thinking...', sender: 'bot' }]);
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === botTypingId ? { id: Date.now() + 2, text: faqs[matchedIndex].a, sender: 'bot' } : m));
        setOptions([
          { id: 'faq', label: 'More Questions' },
          { id: 'start', label: 'Back to main menu' }
        ]);
      }, 800);
      return;
    }

    // Fallback when we don't understand the query
    const botTypingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botTypingId, text: 'Thinking...', sender: 'bot' }]);
    setTimeout(() => {
      const fallback = "I'm sorry, I didn't understand that. Please choose an option below or ask another question.";
      setMessages(prev => prev.map(m => m.id === botTypingId ? { id: Date.now() + 2, text: fallback, sender: 'bot' } : m));
      setOptions([
        { id: 'faq', label: 'Frequently Asked Questions' },
        { id: 'about', label: 'Understand Cancer Herbalist' },
        { id: 'appointment', label: 'Book an Appointment' }
      ]);
    }, 600);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const text = inputValue;
    setInputValue('');
    setOptions([]); // Hide options while responding
    handleUserMessage(text);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="chatbot-btn"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          zIndex: 999,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
        
        {/* Tooltip */}
        {!isOpen && (
          <span
            className="chatbot-tooltip"
            style={{
              position: 'absolute',
              right: '72px',
              background: 'white',
              color: 'var(--dark-2)',
              fontSize: '12px',
              fontWeight: '600',
              padding: '6px 14px',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            Virtual Assistant
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: '180px',
              right: '30px',
              width: '350px',
              height: '500px',
              maxHeight: 'calc(100vh - 200px)',
              background: 'white',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--gray-2)'
            }}
            className="chatbot-window"
          >
            {/* Header */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '16px 20px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  <FaRobot />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>Support Assistant</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: 'var(--gray-1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'var(--dark-2)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    boxShadow: msg.sender === 'bot' ? 'var(--shadow-sm)' : 'none',
                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                  }}>
                    {msg.text}
                    {msg.type === 'action' && (
                      <button
                        onClick={msg.action}
                        style={{
                          display: 'block', width: '100%', marginTop: '10px',
                          padding: '8px 0', background: 'var(--primary-light)',
                          color: 'var(--primary-dark)', border: 'none', borderRadius: '8px',
                          fontWeight: '600', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        {msg.text}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Options */}
              {options.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMessages(prev => [...prev, { id: Date.now(), text: opt.label, sender: 'user' }]);
                        setOptions([]);
                        setTimeout(() => handleOptionClick(opt.id), 400);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '10px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >
                      {opt.label}
                      <FaChevronRight size={10} />
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} style={{
              padding: '16px',
              background: 'white',
              borderTop: '1px solid var(--gray-2)',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '24px',
                  border: '1px solid var(--gray-2)',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: inputValue.trim() ? 'var(--primary)' : 'var(--gray-2)',
                  color: 'white', border: 'none', cursor: inputValue.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s'
                }}
              >
                <FaPaperPlane size={14} style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .chatbot-tooltip {
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
        }
        .chatbot-btn:hover .chatbot-tooltip {
          opacity: 1;
          transform: translateX(0px);
        }
        @media (max-width: 768px) {
          .chatbot-btn {
            bottom: 88px !important; /* Position right above the 68px sticky mobile bar */
            right: 20px !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 24px !important;
          }
          .chatbot-tooltip { display: none !important; }
          .chatbot-window {
            bottom: 80px !important;
            right: 10px !important;
            left: 10px !important;
            width: auto !important;
            height: 60vh !important;
          }
        }
      `}</style>
    </>
  );
}
