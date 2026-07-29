import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShieldAlt, FaDna, FaClock, FaBookMedical } from 'react-icons/fa';

const ACCENT = '#38bed5';

const sections = [
  {
    heading: 'Introduction: Your Immune System Is Already Fighting Cancer',
    body: `Every day your body produces cells that could potentially become cancerous. Yet most people never develop cancer — because the immune system silently identifies and destroys these rogue cells around the clock. Two of the most important soldiers in this invisible war are T-cells and Natural Killer (NK) cells. Understanding how they work can empower you to support your own body's defenses and make more informed decisions about your treatment.`,
  },
  {
    heading: 'What Are T-Cells?',
    body: `T-cells (also called T-lymphocytes) are part of the adaptive immune system — your body's highly trained special forces. They are produced in the bone marrow and mature in the thymus gland (hence the "T"). There are several types:\n\n• Cytotoxic T-cells (CD8+) — The direct killers. They recognize specific proteins (antigens) on the surface of cancer cells and destroy them with precision.\n\n• Helper T-cells (CD4+) — The commanders. They don't kill cancer directly but send chemical signals (cytokines) that coordinate and amplify the entire immune response.\n\n• Memory T-cells — The veterans. After defeating a threat, some T-cells remain in the body for years, ready to respond instantly if the same cancer returns.\n\nThe key superpower of T-cells is specificity. Each T-cell carries a unique T-cell receptor (TCR) designed to recognize one particular antigen. When a T-cell finds its matching target, it multiplies rapidly — creating an entire army dedicated to destroying that specific threat.`,
  },
  {
    heading: 'What Are NK Cells?',
    body: `Natural Killer (NK) cells are part of the innate immune system — your body's rapid-response first responders. Unlike T-cells, NK cells don't need prior exposure to a threat to attack it. They are always on patrol, scanning every cell they encounter.\n\nNK cells use a brilliant detection method called "missing self" recognition. Healthy cells display MHC class I molecules on their surface — essentially an ID badge that says "I'm a normal cell." Cancer cells often lose or hide these ID badges to avoid detection. When NK cells encounter a cell without proper identification, they attack immediately.\n\nNK cells also detect stress signals that appear on damaged or cancerous cells. They balance activating and inhibitory signals — if the activating signals outweigh the inhibitory ones, the NK cell delivers a lethal strike.`,
  },
  {
    heading: 'How They Kill: The Execution Method',
    body: `Both T-cells and NK cells share a remarkably similar method of killing cancer cells:\n\n1. Contact — The immune cell locks onto the cancer cell.\n2. Perforin Release — They release a protein called perforin that punches holes in the cancer cell's membrane.\n3. Granzyme Delivery — Through these holes, they inject granzymes — enzymes that trigger the cancer cell to self-destruct (apoptosis).\n4. Detachment — The immune cell detaches and moves on to find its next target.\n\nA single NK cell or cytotoxic T-cell can kill multiple cancer cells in sequence, making them incredibly efficient warriors.`,
  },
  {
    heading: 'Key Differences at a Glance',
    body: `COMPARISON_TABLE`,
    isTable: true,
  },
  {
    heading: 'How They Work Together Against Cancer',
    body: `T-cells and NK cells aren't competitors — they're teammates that complement each other perfectly:\n\n• First Wave Defense: NK cells respond within hours, controlling early tumor growth while the adaptive immune system mobilizes.\n\n• Activating the Army: NK cells release interferon-gamma (IFN-γ), which activates dendritic cells. These dendritic cells then "train" T-cells by presenting tumor antigens to them.\n\n• Backup System: Some clever cancer cells try to hide from T-cells by removing the specific antigens T-cells recognize. But in doing so, they often lose their MHC molecules — making them visible to NK cells instead. It's a built-in failsafe.\n\n• Long-Term Protection: While NK cells handle the immediate threat, memory T-cells provide long-term surveillance, ready to respond if the cancer ever returns.`,
  },
  {
    heading: 'How Cancer Tries to Escape',
    body: `Cancer is a formidable opponent because it evolves strategies to evade the immune system:\n\n• Antigen Masking: Cancer cells may stop displaying the proteins that T-cells recognize.\n\n• Creating a Suppressive Environment: Tumors can release chemicals that "exhaust" or deactivate nearby immune cells.\n\n• Checkpoint Exploitation: Cancer cells may express proteins like PD-L1 that essentially tell T-cells to "stand down."\n\nModern immunotherapies work by removing these brakes. Checkpoint inhibitors (like pembrolizumab) block the PD-L1 signal, re-energizing T-cells. CAR T-cell therapy genetically engineers a patient's T-cells to recognize cancer better. Emerging NK cell therapies are also being developed to enhance natural killer cell activity against tumors.`,
  },
  {
    heading: 'What You Can Do to Support Your Immune Cells',
    body: `While medical treatments are essential, lifestyle factors can influence how well your immune system functions:\n\n• Nutrition: Adequate protein, vitamins C and D, zinc, and selenium support immune cell production and activity. Colorful fruits and vegetables provide antioxidants that reduce oxidative stress.\n\n• Sleep: Deep sleep is when your body produces and deploys immune cells most actively. Aim for 7–9 hours of quality sleep.\n\n• Stress Management: Chronic stress releases cortisol, which suppresses both T-cell and NK cell activity. Meditation, yoga, and breathing exercises can help.\n\n• Regular Movement: Moderate exercise has been shown to increase NK cell activity and improve T-cell circulation. Even daily walks can make a difference.\n\n• Herbal Support: Certain adaptogens like ashwagandha, tulsi, and medicinal mushrooms (reishi, turkey tail) have been studied for their potential to modulate immune function. Always consult your healthcare provider before adding supplements.`,
  },
  {
    heading: 'Conclusion',
    body: `Your body is not defenseless against cancer. T-cells and NK cells represent two powerful, complementary defense systems that work tirelessly to protect you. While T-cells provide precision targeting and long-term memory, NK cells deliver rapid, broad-spectrum defense. Together, they form an immune surveillance network that is far more sophisticated than any technology we have created.\n\nUnderstanding these defenders empowers you to make informed choices — whether it's supporting your immune system through nutrition and lifestyle, or having meaningful conversations with your oncologist about immunotherapy options. Knowledge truly is your greatest ally in the fight against cancer.`,
  },
];

const comparisonData = [
  { feature: 'Immune System', tcell: 'Adaptive (learned)', nk: 'Innate (built-in)' },
  { feature: 'Response Speed', tcell: 'Days to weeks (needs priming)', nk: 'Hours (immediate)' },
  { feature: 'Target Recognition', tcell: 'Specific antigens via TCR', nk: '"Missing self" & stress signals' },
  { feature: 'Memory', tcell: '✅ Yes — long-term memory', nk: '❌ Generally no' },
  { feature: 'Activation Needed', tcell: 'Must be trained by dendritic cells', nk: 'No prior training required' },
  { feature: 'Cancer Role', tcell: 'Precision strikes on known targets', nk: 'First responders & backup' },
  { feature: 'Therapy Example', tcell: 'CAR T-cell therapy', nk: 'NK cell infusion therapy' },
];

export default function TCellsVsNKCells() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0b5b67 0%, #1a8a9b 50%, #38bed5 100%)', padding: '130px 20px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
          <Link to="/patient-education" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
            <FaArrowLeft /> Back to Patient Education
          </Link>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, color: '#fff' }}>🧬 Immunology</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock /> 10 min read</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.25, marginBottom: '20px' }}>
            T-Cells vs NK Cells: Your Body&apos;s Cancer-Fighting Warriors
          </motion.h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '700px', lineHeight: 1.8, fontSize: 'clamp(0.9rem, 2vw, 1.05rem)' }}>
            A patient-friendly guide to understanding the two immune cell types that form your body&apos;s frontline defense against cancer and infection.
          </p>
        </div>
      </div>

      {/* Visual Summary Cards */}
      <div style={{ maxWidth: '860px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
          {[
            { title: 'T-Cells', subtitle: 'The Precision Soldiers', icon: <FaDna />, color: '#0b5b67', points: ['Part of adaptive immunity', 'Highly specific targeting', 'Create long-term memory', 'Need training to activate'] },
            { title: 'NK Cells', subtitle: 'The First Responders', icon: <FaShieldAlt />, color: ACCENT, points: ['Part of innate immunity', 'Broad-spectrum defense', 'No prior training needed', 'Immediate rapid response'] },
          ].map((card) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', border: `2px solid ${card.color}18` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: card.color }}>{card.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'Playfair Display, serif', color: '#0f172a', margin: 0 }}>{card.title}</h3>
                  <span style={{ fontSize: '13px', color: card.color, fontWeight: 600 }}>{card.subtitle}</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {card.points.map((p, i) => (
                  <li key={i} style={{ padding: '6px 0', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.color, flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 20px' }}>
        {sections.map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} style={{ marginBottom: '44px' }}>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontFamily: 'Playfair Display, serif', marginBottom: '18px', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: 1.35 }}>
              <FaBookMedical style={{ color: ACCENT, fontSize: '16px', flexShrink: 0, marginTop: '5px' }} />
              {section.heading}
            </h2>

            {section.isTable ? (
              <div style={{ overflowX: 'auto', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: '14px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #0b5b67, #38bed5)' }}>
                      <th style={{ padding: '14px 18px', color: '#fff', textAlign: 'left', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Feature</th>
                      <th style={{ padding: '14px 18px', color: '#fff', textAlign: 'left', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>T-Cells</th>
                      <th style={{ padding: '14px 18px', color: '#fff', textAlign: 'left', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>NK Cells</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '13px 18px', fontWeight: 600, color: '#0f172a' }}>{row.feature}</td>
                        <td style={{ padding: '13px 18px', color: '#475569' }}>{row.tcell}</td>
                        <td style={{ padding: '13px 18px', color: '#475569' }}>{row.nk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#475569', lineHeight: 1.9, fontSize: '1rem' }}>
                {section.body.split('\n\n').map((para, pi) => (
                  <p key={pi} style={{ marginBottom: '14px' }}>
                    {para.startsWith('•') || para.startsWith('1.') ? (
                      <span style={{ display: 'block', paddingLeft: '8px' }}>{para}</span>
                    ) : para}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '16px', padding: '20px 24px', marginBottom: '40px' }}>
          <p style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            ⚠️ <strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Always consult your oncologist and healthcare team before making any changes to your treatment plan.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f0fdfe, #e0f7fa)', borderRadius: '24px', padding: '40px' }}>
          <h3 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '12px' }}>Want Expert Guidance on Immune Support?</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Our herbal medicine specialists can create a personalized immune-support protocol tailored to your needs.</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: ACCENT, color: '#fff', padding: '14px 36px', borderRadius: '50px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', boxShadow: `0 8px 24px ${ACCENT}44` }}>
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
