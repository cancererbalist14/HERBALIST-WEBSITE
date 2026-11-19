import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRibbon, FaLungs, FaAppleAlt, FaHeartbeat, FaRegHospital, FaTint,
  FaArrowLeft, FaLeaf, FaCheckCircle, FaShieldAlt, FaUserMd, FaFlask,
  FaChevronDown, FaStethoscope, FaExclamationTriangle, FaQuestionCircle,
  FaWhatsapp, FaArrowRight
} from 'react-icons/fa';
import IntegrativeTherapies from '../components/IntegrativeTherapies';
import PersonalizedTreatmentPlans from '../components/PersonalizedTreatmentPlans';
import PatientResources from '../components/PatientResources';


const ACCENT = '#38bed5';
const ACCENT_LIGHT = '#e0f7fa';
const PRIMARY = '#1a6e52';

const servicesData = {
  'breast-cancer': {
    icon: <FaRibbon />,
    title: 'Breast Cancer Support Program',
    subtitle: 'Integrative Care, Estrogen Modulation & Post-Surgical Support',
    seoDescription: 'Explore complementary nutrition and wellness information for people navigating breast cancer care alongside their oncology team.',
    heroImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1600&q=80',
    overview: `Breast cancer is one of the most widely diagnosed conditions globally. At Cancer Herbalist, we provide a specialized supportive program designed to work alongside conventional options like chemotherapy, radiation, and hormone therapies. Our goal is to focus on the reduction of inflammation, promote immune system support, and help manage treatment side effects so you can sustain strength throughout the cancer journey.`,
    symptoms: [
      'A new lump or area of thickened tissue in either breast or underarm.',
      'A change in the size, shape, or outline of one or both breasts.',
      'Discharge from either of your nipples, which may be streaked with blood.',
      'Dimpling, puckering, or redness of the skin on your breast.',
      'A rash on or around your nipple, or a change in nipple appearance.'
    ],
    riskFactors: [
      'Advancing age (most common in women over 50).',
      'Family history of breast or ovarian cancer, including inherited BRCA1 or BRCA2 genes.',
      'Extended lifetime exposure to estrogen, such as early menstruation or late menopause.',
      'Dense breast tissue and history of certain benign breast conditions.',
      'Lifestyle factors including alcohol consumption and high systemic inflammation.'
    ],
    conventionalTreatments: [
      { name: 'Surgery', desc: 'Lumpectomy or mastectomy to physically remove tumor tissues and verify lymph node involvement.' },
      { name: 'Chemotherapy', desc: 'Systemic cytotoxic drugs used to destroy rapidly dividing cancer cells, often before (neoadjuvant) or after (adjuvant) surgery.' },
      { name: 'Radiation Therapy', desc: 'High-energy X-rays targeted at the breast area to eliminate any microscopic cancer cells remaining after surgery.' },
      { name: 'Hormone Therapy', desc: 'Estrogen-blocking medications (Tamoxifen, Aromatase Inhibitors) prescribed for hormone-receptor-positive (ER+/PR+) cancers.' },
      { name: 'Targeted & Immunotherapy', desc: 'Advanced drugs (like Herceptin) targeting specific protein receptors (HER2) or boosting immune-mediated clearance.' }
    ],
    integrativeSupport: [
      {
        title: 'Herbal Nutritional Support',
        desc: 'Focuses on optimizing nutritional wellness and cellular vitality during standard medical treatments.'
      },
      {
        title: 'Reduction of Inflammation',
        desc: 'Utilizes high-quality curcuminoids and botanical infusions to support the body in calming systemic inflammatory pathways.'
      },
      {
        title: 'Immune System Support',
        desc: 'Aims to promote balanced immune responses, supporting both cell-mediated immunity and innate immunity.'
      },
      {
        title: 'Gut Health & Microbiota Support',
        desc: 'Focuses on maintaining healthy intestinal flora, which is essential for proper hormone clearance and nutrient absorption.'
      },
      {
        title: 'Support During Chemo & Radiation',
        desc: 'Designed to help manage fatigue, soothe tissues, and protect vital organs from standard treatment strain.'
      },
      {
        title: 'Bone Marrow Support',
        desc: 'Aims to support general blood health, leukocyte balance, and optimal cell counts throughout intensive care cycles.'
      },
      {
        title: 'Recovery Support After Surgery',
        desc: 'Promotes natural wound healing support, tissue resilience, and post-operative physical comfort.'
      },
      {
        title: 'Nutritional Support Throughout',
        desc: 'Ensures personalized dietary guidance to meet the body\'s shifting needs at every stage of the cancer journey.'
      }
    ],
    whyChoose: [
      'Tailored to match your ER/PR and HER2 status for optimal synergy.',
      'Carefully selected ingredients with zero hormone-disrupting herbs.',
      'Continuous support and weekly adjustments to align with your clinical oncologist\'s schedule.'
    ],
    faqs: [
      {
        q: 'Is this program safe to combine with hormone-blocking therapies like Tamoxifen?',
        a: 'Yes. Our protocols are specifically customized to exclude any herbs that might interfere with hormone-blocking medications, focusing instead on liver clearance and systemic wellbeing.'
      },
      {
        q: 'How does this help during radiation therapy?',
        a: 'It offers targeted herbal nutritional support to promote skin resilience, aid cell-mediated immunity, and protect vital organs from oxidative load.'
      },
      {
        q: 'Can this replace conventional surgery or chemotherapy?',
        a: 'No. Our programs are purely complementary and designed to support your body while you undergo standard medical treatments recommended by your oncology team.'
      }
    ]
  },
  'lung-cancer': {
    icon: <FaLungs />,
    title: 'Lung Cancer Support Program',
    subtitle: 'Respiratory Strength, Pulmonary Resilience & Vital Organ Protection',
    seoDescription: 'Explore complementary nutrition and wellness information for people navigating lung cancer care alongside their oncology team.',
    heroImage: 'https://images.unsplash.com/photo-1616012480717-fd9867059ca0?auto=format&fit=crop&w=1600&q=80',
    overview: `Lung cancer presents significant challenges related to airway comfort, breathing capacity, and intensive clinical therapies. Our integrative cancer care focuses on supporting respiratory wellbeing, maintaining pulmonary tissue resilience, reducing chronic airway inflammation, and protecting vital organs during chemo and radiation treatments.`,
    symptoms: [
      'A persistent cough that does not go away or changes in a long-standing cough.',
      'Shortness of breath or difficulty breathing during everyday activities.',
      'Chest pain or discomfort that may worsen with deep breathing or coughing.',
      'Wheezing, hoarseness, or coughing up blood (hemoptysis).',
      'Unexplained weight loss and persistent physical fatigue.'
    ],
    riskFactors: [
      'Active smoking or long-term history of tobacco use.',
      'Secondhand smoke exposure in home or workplace environments.',
      'Inhalation of environmental carcinogens (radon, asbestos, silica, or diesel exhaust).',
      'Pre-existing chronic lung diseases (COPD, pulmonary fibrosis).',
      'Family history of lung diseases or general genetic susceptibility.'
    ],
    conventionalTreatments: [
      { name: 'Surgery', desc: 'Surgical removal of a lung lobe (lobectomy), segment, or the entire lung to excise localized tumors.' },
      { name: 'Chemotherapy', desc: 'Intravenous drugs targeted at stopping cancer cells throughout the body from dividing, frequently used for advanced stages.' },
      { name: 'Radiation Therapy', desc: 'Targeted high-energy beams to shrink tumors and treat localized regions, often combined with chemotherapy.' },
      { name: 'Targeted Drug Therapy', desc: 'Focuses on specific genetic mutations (like EGFR or ALK) commonly present in non-small cell lung cancer (NSCLC).' },
      { name: 'Immunotherapy', desc: 'Monoclonal antibodies (checkpoint inhibitors) that help the patient’s own immune system identify and destroy lung cancer cells.' }
    ],
    integrativeSupport: [
      {
        title: 'Herbal Nutritional Support',
        desc: 'Focuses on optimizing respiratory nutrition, airway clearing, and supporting systemic vitality.'
      },
      {
        title: 'Reduction of Inflammation',
        desc: 'Uses specialized expectorant and anti-inflammatory botanicals to soothe inflamed bronchial tissues.'
      },
      {
        title: 'Immune System Support',
        desc: 'Designed to support the body’s innate immunity and cell-mediated immunity to maintain active defenses.'
      },
      {
        title: 'Gut Health & Microbiota Support',
        desc: 'Supports healthy intestinal microbiota to enhance baseline energy production and nutrient absorption.'
      },
      {
        title: 'Adaptogenic Herbs',
        desc: 'Incorporates high-grade adaptogens to support stamina, restore physical energy, and manage chronic stress.'
      },
      {
        title: 'Protection of Vital Organs',
        desc: 'Aims to protect pulmonary tissue and vital organs from oxidative damage caused by radiation or chemo.'
      },
      {
        title: 'Support During Chemo & Radiation',
        desc: 'Part of an integrative nutritional approach to soothe mucous membranes and maintain physical comfort.'
      },
      {
        title: 'Recovery Support After Surgery',
        desc: 'Supports natural wound healing support, tissue repair, and airway rehabilitation post-resection.'
      }
    ],
    whyChoose: [
      'Focuses on pulmonary comfort, clearing congestion, and preserving tissue resilience.',
      'Uses organic, heavy-metal-tested adaptogens that do not burden respiratory function.',
      'Weekly consults to adjust formulas to match your clinical treatment schedule.'
    ],
    faqs: [
      {
        q: 'Can these herbs ease breathing during active lung cancer treatment?',
        a: 'Yes. Certain demulcent and bronchodilatory herbs are included to soothe inflamed airways and support respiratory comfort, working alongside your primary care.'
      },
      {
        q: 'Does this support bone marrow during chemotherapy?',
        a: 'Yes, we include adaptogens and blood-building tonics that support bone marrow function and healthy cell counts.'
      },
      {
        q: 'Is this program suitable for non-smokers with lung cancer?',
        a: 'Absolutely. The protocol is tailored to the individual\'s unique symptoms and conventional treatment plan, regardless of their smoking history.'
      }
    ]
  },
  'colon-cancer': {
    icon: <FaAppleAlt />,
    title: 'Colon Cancer Support Program',
    subtitle: 'Gut Health, Microbiota Balance & Digestive Restoration',
    seoDescription: 'Learn about digestive, nutrition and complementary wellness information for people navigating colon cancer care.',
    heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80',
    overview: `Colon cancer and its clinical treatments—including surgery, systemic chemotherapy, and radiation—profoundly affect the gastrointestinal tract. Our integrative cancer care program focuses on gut health and microbiota support, soothing intestinal lining, promoting reduction of inflammation, and providing nutritional support throughout the cancer journey.`,
    symptoms: [
      'A persistent change in bowel habits, including diarrhea, constipation, or narrowing of stool.',
      'Rectal bleeding or blood visible in your stool.',
      'Persistent abdominal discomfort, such as cramps, gas pain, or feeling bloated.',
      'A feeling that your bowel doesn\'t empty completely during movements.',
      'Weakness, fatigue, and unexplained weight loss.'
    ],
    riskFactors: [
      'Inflammatory bowel diseases (IBD) such as long-standing Ulcerative Colitis or Crohn\'s Disease.',
      'A diet high in red or processed meats and low in fiber and antioxidants.',
      'A personal or family history of colorectal polyps or colorectal cancer.',
      'Sedentary lifestyle, obesity, and insulin resistance.',
      'Genetic syndromes like Lynch syndrome (HNPCC) or Familial Adenomatous Polyposis (FAP).'
    ],
    conventionalTreatments: [
      { name: 'Surgery', desc: 'Surgical resection (colectomy) to remove the cancerous section of the colon along with nearby lymph nodes.' },
      { name: 'Chemotherapy', desc: 'Post-operative systemic drugs (adjuvant chemotherapy) to eradicate microscopic cancer cells and reduce recurrence risk.' },
      { name: 'Radiation Therapy', desc: 'Often used for rectal cancers before surgery to shrink tumors, or to control symptoms in advanced colon cancer.' },
      { name: 'Targeted Therapy', desc: 'Drugs targeting specific molecular pathways (VEGF, EGFR) to restrict blood supply to tumors or stop growth signals.' },
      { name: 'Immunotherapy', desc: 'Indicated for advanced colorectal cancers with specific genetic features (MSI-H or dMMR).' }
    ],
    integrativeSupport: [
      {
        title: 'Gut Health & Microbiota Support',
        desc: 'Focuses on repairing the mucosal lining, balancing gut flora, and optimizing nutrient absorption.'
      },
      {
        title: 'Reduction of Inflammation',
        desc: 'Employs soothing demulcent botanicals that help quiet local irritation in the bowel tract.'
      },
      {
        title: 'Immune System Support',
        desc: 'Supports gut-associated lymphoid tissue (GALT), aiding cell-mediated immunity and innate immunity.'
      },
      {
        title: 'Herbal Nutritional Support',
        desc: 'Aims to supply easily absorbable nutrients to bypass digestive compromise and support stamina.'
      },
      {
        title: 'Support During Chemotherapy',
        desc: 'Helps soothe gut lining, manage nausea, and support digestive comfort during chemotherapy cycles.'
      },
      {
        title: 'Protection of Vital Organs',
        desc: 'Provides liver protection to assist your body in processing oncology medications safely.'
      },
      {
        title: 'Recovery Support After Surgery',
        desc: 'Promotes wound healing support and tissue repair along the intestinal tract post-resection.'
      },
      {
        title: 'Adaptogenic Herbs',
        desc: 'Utilizes gentle adaptogens to help manage fatigue, improve stress tolerance, and support overall wellbeing.'
      }
    ],
    whyChoose: [
      'Direct focus on gut lining restoration and microbiome recovery.',
      'Specially designed low-inflammatory diet plans tailored for digestive comfort.',
      'Completely non-laxative, soothing herbal blends tested for utmost safety.'
    ],
    faqs: [
      {
        q: 'Will these herbs cause diarrhea or worsen bowel irritation?',
        a: 'No. We explicitly avoid harsh laxatives or irritating plants. The formulas contain demulcents like slippery elm and marshmallow root, which coat and soothe the digestive tract.'
      },
      {
        q: 'Can this support recovery after a bowel resection?',
        a: 'Yes. The herbs are designed to support natural wound healing support and help the digestive system adapt to structural changes post-surgery.'
      },
      {
        q: 'How does it support my gut microbiome during chemotherapy?',
        a: 'We incorporate prebiotic botanicals that nourish beneficial gut bacteria, helping maintain a balanced microbiota and supporting your immune health.'
      }
    ]
  },
  'prostate-cancer': {
    icon: <FaHeartbeat />,
    title: 'Prostate Cancer Support Program',
    subtitle: 'Urinary Comfort, Pelvic Health & Hormonal Balance',
    seoDescription: 'Learn about complementary nutrition and wellness information for people navigating prostate cancer care.',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
    overview: `Prostate cancer and its treatment, particularly hormone therapies, present distinct physical and emotional challenges. Our integrative cancer care focuses on promoting pelvic comfort, supporting healthy urinary flow, managing the side effects of hormone treatments, and providing adaptogenic support to maintain strength, bone density, and overall wellbeing.`,
    symptoms: [
      'Difficulty starting urination or a weak, interrupted urine flow.',
      'A frequent urge to urinate, especially during night hours.',
      'Pain, discomfort, or a burning sensation during urination.',
      'Blood in the semen or urine, or discomfort in the pelvic area.'
    ],
    riskFactors: [
      'Advancing age (most commonly diagnosed in men over 50).',
      'Family history of prostate, breast, or ovarian cancers.',
      'Diets rich in saturated animal fats and low in protective phytonutrients.',
      'Chronic pelvic inflammation and environmental exposures.'
    ],
    conventionalTreatments: [
      { name: 'Active Surveillance', desc: 'Close monitoring with regular PSA tests and biopsies for low-risk, slow-growing prostate cancers.' },
      { name: 'Surgery', desc: 'Radical prostatectomy to surgically remove the entire prostate gland and surrounding seminal vesicles.' },
      { name: 'Radiation Therapy', desc: 'External beam radiation or brachytherapy (radioactive seed implants) targeting the prostate gland directly.' },
      { name: 'Hormone Therapy (ADT)', desc: 'Androgen Deprivation Therapy to lower testosterone levels, which prostate cancer cells rely on to grow.' },
      { name: 'Chemotherapy & Targeted Agents', desc: 'Systemic treatments reserved for advanced, metastatic, or castrate-resistant prostate cancers.' }
    ],
    integrativeSupport: [
      {
        title: 'Pelvic Inflammation Reduction',
        desc: 'Focuses on using targeted, cooling botanicals to reduce chronic inflammation in pelvic tissues.'
      },
      {
        title: 'Urinary Tract Support',
        desc: 'Aims to promote comfortable bladder emptying, ease pressure, and support urinary tract health.'
      },
      {
        title: 'Adaptogenic Herbs',
        desc: 'Includes key adaptogens to manage stress, support muscle tone, and help balance vitality.'
      },
      {
        title: 'Immune System Support',
        desc: 'Designed to support cell-mediated immunity and innate immunity for balanced bodily defenses.'
      },
      {
        title: 'Bone Marrow Support',
        desc: 'Aims to support general blood health and bone marrow function during clinical treatments.'
      },
      {
        title: 'Protection of Vital Organs',
        desc: 'Aids liver and kidney detoxification pathways to help process clinical hormone treatments.'
      },
      {
        title: 'Nutritional Support Throughout',
        desc: 'Supplies high-antioxidant, plant-based dietary guidance to support healthy prostate cells.'
      },
      {
        title: 'Support for Overall Wellbeing',
        desc: 'Aims to improve sleep quality, support physical stamina, and boost mental health.'
      }
    ],
    whyChoose: [
      'Tailored protocols that align perfectly with active surveillance or active treatment phases.',
      'Focuses on preserving urinary comfort, pelvic health, and baseline hormonal stability.',
      'Non-conflicting support that safely accompanies clinical oncological therapies.'
    ],
    faqs: [
      {
        q: 'Can this program be used while on hormone therapy (ADT)?',
        a: 'Yes. Our protocol is designed to support you through hormone therapy side effects, helping maintain energy, muscle tone, and bone density with safe, non-interfering adaptogens.'
      },
      {
        q: 'Will this affect my PSA readings?',
        a: 'No. The program is designed as supportive nutrition. It does not mask or artificially alter your PSA readings, allowing your oncologist to track your progress accurately.'
      },
      {
        q: 'Are these herbs safe for long-term use?',
        a: 'Yes, we utilize well-tolerated, nourishing botanicals that are safe for extended support, under the guidance of our practitioners.'
      }
    ]
  },
  'liver-cancer': {
    icon: <FaRegHospital />,
    title: 'Liver Cancer Support Program',
    subtitle: 'Hepatoprotection, Detoxification & Metabolic Support',
    seoDescription: 'Explore complementary nutrition and wellness information for people navigating liver cancer care alongside their oncology team.',
    heroImage: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1600&q=80',
    overview: `The liver is the body's central metabolic and clearing organ. Liver cancer and hepatic therapies require highly specialized, gentle care. Our hepatoprotective program is focused on supporting liver cell integrity, optimizing metabolic function, promoting reduction of inflammation, and protecting vital organs throughout the cancer journey.`,
    symptoms: [
      'Unexplained loss of appetite or feeling full after eating very little.',
      'Upper abdominal discomfort, swelling, or localized pain near the right rib cage.',
      'Yellowish discoloration of the skin and whites of the eyes (jaundice).',
      'Persistent nausea, vomiting, or deep, unexplained physical exhaustion.',
      'Abdominal swelling due to fluid retention (ascites) and pale, chalky stools.'
    ],
    riskFactors: [
      'Chronic viral hepatitis B or C infection causing long-term liver inflammation.',
      'Liver cirrhosis or non-alcoholic fatty liver disease (NAFLD).',
      'Heavy long-term alcohol consumption.',
      'Exposure to environmental liver toxins, industrial chemicals, or aflatoxins.'
    ],
    conventionalTreatments: [
      { name: 'Surgical Resection', desc: 'Partial hepatectomy to remove the tumor and a margin of healthy tissue, suitable for patients with good liver function.' },
      { name: 'Liver Transplantation', desc: 'Replacing the diseased liver with a healthy donor liver, which addresses both the tumor and underlying cirrhosis.' },
      { name: 'Localized Ablation & Embolization', desc: 'Using heat (RFA), cold (cryo), or blocking blood supply (TACE/TAE) to destroy cancer cells locally.' },
      { name: 'Targeted Drug Therapy', desc: 'Systemic tyrosine kinase inhibitors (e.g., Sorafenib) designed to block tumor blood vessel growth and cell division signals.' },
      { name: 'Immunotherapy', desc: 'Combining immune checkpoint inhibitors to assist T-cells in recognizing and attacking primary liver cancer cells.' }
    ],
    integrativeSupport: [
      {
        title: 'Hepatoprotective Support',
        desc: 'Focuses on protecting healthy liver cells from oxidative stress and toxic load.'
      },
      {
        title: 'Reduction of Inflammation',
        desc: 'Employs milk thistle and active curcumin to support the ease of hepatic tissues.'
      },
      {
        title: 'Immune System Support',
        desc: 'Promotes innate immunity and cell-mediated immunity to support overall body defense.'
      },
      {
        title: 'Protection of Vital Organs',
        desc: 'Aims to shield kidneys, heart, and liver, helping process systemic clinical treatments safely.'
      },
      {
        title: 'Gut Health & Microbiota Support',
        desc: 'Aids the gut-liver axis by supporting healthy bile flow, digestion, and gut flora balance.'
      },
      {
        title: 'Adaptogenic Herbs',
        desc: 'Incorporates gentle adaptogens to help manage physical fatigue and support baseline stamina.'
      },
      {
        title: 'Bone Marrow Support',
        desc: 'Helps support blood clotting factors and general bone marrow health during treatments.'
      },
      {
        title: 'Recovery Support After Surgery',
        desc: 'Promotes natural wound healing support and liver cell regeneration post-resection.'
      }
    ],
    whyChoose: [
      'Uses only highly purified, non-heavy metal tested, liver-safe herbal extracts.',
      'Coordinated with your liver enzyme panels for maximum safety.',
      'Focuses on liver clearance pathways to assist overall metabolic function.'
    ],
    faqs: [
      {
        q: 'Are these herbs safe if my liver enzymes are elevated?',
        a: 'Yes. We select gentle, non-toxic hepatoprotective herbs that help support liver cell integrity and ease stress on hepatic enzymes, under close supervision.'
      },
      {
        q: 'Can this be combined with targeted liver chemotherapy or ablation?',
        a: 'Absolutely. The program is designed to protect vital organs and support your body\'s natural clearing pathways during clinical treatments.'
      },
      {
        q: 'Is there a specific diet I should follow?',
        a: 'Yes. We provide a specialized low-toxin, easy-to-digest diet plan to minimize the metabolic load on your liver.'
      }
    ]
  },
  'blood-cancer': {
    icon: <FaTint />,
    title: 'Blood Cancer Support Program',
    subtitle: 'Immune Modulation, Bone Marrow Support & Blood Vitality',
    seoDescription: 'Learn about nutrition and complementary wellness information for people navigating blood cancer care.',
    heroImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1600&q=80',
    overview: `Blood cancers, including leukemia, lymphoma, and myeloma, directly impact the lymphatic and blood-forming systems. Our integrative care program focuses on immune modulation, providing bone marrow support, protecting vital organs, and delivering targeted nutritional support throughout the cancer journey to manage treatment side effects.`,
    symptoms: [
      'Frequent, persistent infections or unexplained fevers and chills.',
      'Easy bruising or unusual bleeding (such as frequent nosebleeds or bleeding gums).',
      'Painless swelling of the lymph nodes in the neck, armpits, or groin.',
      'Persistent fatigue, weakness, short breath, or pale skin (anemia symptoms).',
      'Severe night sweats, bone pain, joint stiffness, and unexplained weight loss.'
    ],
    riskFactors: [
      'Prior exposure to high levels of radiation or specific chemicals like benzene.',
      'Pre-existing immune system disorders or history of certain viral infections (e.g. EBV).',
      'Advancing age, although certain leukemias and lymphomas commonly affect children.',
      'Family history or underlying genetic conditions like Down syndrome.'
    ],
    conventionalTreatments: [
      { name: 'Chemotherapy', desc: 'The primary treatment using potent drugs to kill leukemia, lymphoma, or myeloma cells in the blood and bone marrow.' },
      { name: 'Radiation Therapy', desc: 'Targeted radiation to reduce pain in bone lesions or shrink swollen lymph nodes and spleen tissues.' },
      { name: 'Stem Cell / Bone Marrow Transplant', desc: 'Infusing healthy stem cells to restore bone marrow function after intensive high-dose chemotherapy.' },
      { name: 'Targeted Therapy', desc: 'Drugs designed to attack specific abnormalities within leukemia or lymphoma cells (e.g., tyrosine kinase inhibitors).' },
      { name: 'Immunotherapy & CAR-T Cell Therapy', desc: 'Engineering patient T-cells or using monoclonal antibodies to target specific proteins on blood cancer cells.' }
    ],
    integrativeSupport: [
      {
        title: 'Bone Marrow Support',
        desc: 'Focuses on supporting healthy hematopoietic function and blood cell restoration.'
      },
      {
        title: 'Immune System Support',
        desc: 'Designed to support cell-mediated immunity and innate immunity without overstimulating blood cells.'
      },
      {
        title: 'Reduction of Inflammation',
        desc: 'Employs cooling botanicals to help manage systemic inflammation and tissue stress.'
      },
      {
        title: 'Protection of Vital Organs',
        desc: 'Focuses on protecting kidneys, liver, and cardiac tissues during intensive chemotherapy.'
      },
      {
        title: 'Adaptogenic Herbs',
        desc: 'Utilizes premium adaptogens to help manage fatigue, restore physical energy, and support mood.'
      },
      {
        title: 'Gut Health & Microbiota Support',
        desc: 'Aids intestinal barrier health to support immunity and prevent infections during neutropenia.'
      },
      {
        title: 'Wound Healing Support',
        desc: 'Aims to support natural tissue repair and promote recovery after minor procedures or bruising.'
      },
      {
        title: 'Nutritional Support Throughout',
        desc: 'Provides specialized diet protocols rich in blood-building nutrients and vital antioxidants.'
      }
    ],
    whyChoose: [
      'Expert immune-modulating focus that avoids leukocyte overstimulation.',
      'Completely sterile, high-safety botanicals suited for sensitive immune states.',
      'Weekly consultations to align with your clinical chemotherapy cycles.'
    ],
    faqs: [
      {
        q: 'Can I take these herbs during a bone marrow transplant?',
        a: 'We pause active herbal intake during the immediate transplant phase and resume during post-transplant recovery to support bone marrow support and wound healing support.'
      },
      {
        q: 'How does it support my immune system?',
        a: 'It uses specific immune modulators that help support innate immunity and cell-mediated immunity without triggering leukocyte overproduction.'
      },
      {
        q: 'Is it safe to take alongside chemotherapy?',
        a: 'Yes. We work with low-interaction herbs that focus on vital organ protection and reducing side effects.'
      }
    ]
  }
};

export default function ServiceDetail() {
  const { id } = useParams();
  const service = servicesData[id];
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!service) return;

    // 1. Update Title
    const pageTitle = `${service.title} | Cancer Herbalist`;
    document.title = pageTitle;
    const canonicalPath = window.location.pathname.replace(/\\/+$/, '') || '/';
    const canonicalUrl = `https://cancerherbalist.com${canonicalPath}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', service.seoDescription);

    // 3. Update OG Tags
    const updateOGTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', pageTitle);
    updateOGTag('og:description', service.overview);
    updateOGTag('og:url', canonicalUrl);
    updateOGTag('og:image', service.heroImage);

    // 4. Inject MedicalWebPage and FAQPage Structured Data
    const existingScript = document.getElementById('seo-schema-markup');
    if (existingScript) {
      existingScript.remove();
    }

    const faqSchemaQuestions = service.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }));

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage',
          '@id': canonicalUrl,
          'url': canonicalUrl,
          'name': service.title,
          'description': service.overview,
          'about': {
            '@type': 'MedicalCondition',
            'name': service.title.replace(' Support Program', ''),
            'possibleTreatment': {
              '@type': 'MedicalTherapy',
              'name': 'Integrative Herbal Nutritional Support'
            }
          }
        },
        {
          '@type': 'FAQPage',
          '@id': `${window.location.href}#faq`,
          'mainEntity': faqSchemaQuestions
        }
      ]
    };

    const script = document.createElement('script');
    script.id = 'seo-schema-markup';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const scriptToRemove = document.getElementById('seo-schema-markup');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [service, id]);

  if (!service) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#0f172a' }}>Service not found</h2>
        <Link to="/care-programs" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>← Back to Care Programs</Link>
      </div>
    );
  }


  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '0' }}>
      
      {/* Hero Section */}
      <div style={{ position: 'relative', height: '460px', overflow: 'hidden' }}>
        <img
          src={service.heroImage}
          alt={service.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,30,60,0.85) 0%, rgba(10,30,60,0.45) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5%', maxWidth: '900px' }}>
          <Link to="/care-programs" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
            <FaArrowLeft /> Back to Care Programs
          </Link>
          <div style={{ fontSize: '48px', color: ACCENT, marginBottom: '16px' }}>{service.icon}</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,3.2rem)', fontFamily: 'Playfair Display, serif', marginBottom: '12px', fontWeight: 700 }}>
            {service.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '650px', lineHeight: '1.6' }}>
            {service.subtitle}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        {/* Overview, Symptoms & Risk Factors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', marginBottom: '60px' }}>
          
          {/* Overview */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow-md)', borderLeft: `6px solid ${ACCENT}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FaLeaf style={{ color: ACCENT, fontSize: '24px' }} />
              <h2 style={{ color: 'var(--dark-2)', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Program Overview</h2>
            </div>
            <p style={{ color: 'var(--gray-3)', lineHeight: '1.9', fontSize: '1.05rem' }}>{service.overview}</p>
          </motion.section>

          {/* Symptoms & Risk Factors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            
            {/* Symptoms */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <FaStethoscope style={{ color: ACCENT, fontSize: '22px' }} />
                <h3 style={{ color: 'var(--dark-2)', fontSize: '1.4rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Common Signs & Symptoms</h3>
              </div>
              <ul style={{ paddingLeft: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {service.symptoms.map((symptom, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <FaExclamationTriangle style={{ color: '#FBBF24', fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                    <span style={{ color: 'var(--gray-3)', fontSize: '0.98rem', lineHeight: '1.6' }}>{symptom}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Risk Factors */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <FaShieldAlt style={{ color: ACCENT, fontSize: '22px' }} />
                <h3 style={{ color: 'var(--dark-2)', fontSize: '1.4rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>Understanding Risk Factors</h3>
              </div>
              <ul style={{ paddingLeft: '0', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {service.riskFactors.map((factor, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <FaCheckCircle style={{ color: ACCENT, fontSize: '16px', marginTop: '4px', flexShrink: 0 }} />
                    <span style={{ color: 'var(--gray-3)', fontSize: '0.98rem', lineHeight: '1.6' }}>{factor}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

          </div>
        </div>

        {/* Conventional Treatments */}
        {service.conventionalTreatments && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '60px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span className="section-badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                <FaRegHospital /> Standard Medical Care
              </span>
              <h2 className="section-title" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
                Conventional <span>Treatments</span>
              </h2>
              <p className="section-subtitle" style={{ margin: '0 auto', color: 'var(--gray-3)' }}>
                Standard oncology treatments commonly used for primary tumor control and systemic cancer elimination.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
              {service.conventionalTreatments.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid var(--gray-2)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '16px' }}>
                      <FaRegHospital />
                    </div>
                    <h4 style={{ color: 'var(--dark-2)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{item.name}</h4>
                  </div>
                  <p style={{ color: 'var(--gray-3)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

      </div> {/* Close 1200px container for full-width sections */}

      <IntegrativeTherapies />
      <PersonalizedTreatmentPlans />
      <PatientResources />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}> {/* Reopen 1200px container */}

        {/* Our Integrative Nutritional Support */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '60px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-badge" style={{ background: ACCENT_LIGHT, color: PRIMARY, border: `1px solid ${ACCENT}33` }}>
              <FaFlask /> Integrative Care Focus
            </span>
            <h2 className="section-title" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Our <span>Integrative Nutritional Support</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto', color: 'var(--gray-3)' }}>
              Providing comprehensive, compliant, and supportive protocols to care for the body at every stage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
            {service.integrativeSupport.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  border: '1px solid var(--gray-2)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: ACCENT_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontSize: '16px' }}>
                    <FaCheckCircle />
                  </div>
                  <h4 style={{ color: 'var(--dark-2)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{item.title}</h4>
                </div>
                <p style={{ color: 'var(--gray-3)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Choose Cancer Herbalist */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ background: '#fff', borderRadius: '24px', padding: '40px', marginBottom: '60px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <FaUserMd style={{ color: ACCENT, fontSize: '24px' }} />
            <h2 style={{ color: 'var(--dark-2)', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
              Why Choose Cancer Herbalist
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {service.whyChoose.map((reason, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f8fafc', borderRadius: '16px', padding: '24px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: ACCENT, opacity: 0.3, lineHeight: 1 }}>0{i+1}</span>
                <div>
                  <p style={{ color: 'var(--gray-3)', fontSize: '0.98rem', lineHeight: '1.65', margin: 0, fontWeight: 500 }}>{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* FAQs Accordion */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '60px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
            <FaQuestionCircle style={{ color: ACCENT, fontSize: '24px' }} />
            <h2 style={{ color: 'var(--dark-2)', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {service.faqs.map((faq, i) => (
              <div 
                key={i} 
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  border: openFaq === i ? `1.5px solid ${ACCENT}` : '1.5px solid var(--gray-2)', 
                  overflow: 'hidden',
                  boxShadow: openFaq === i ? `0 8px 24px ${ACCENT}15` : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    background: openFaq === i ? ACCENT_LIGHT : 'transparent',
                    border: 'none',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-2)', fontFamily: 'Poppins, sans-serif' }}>{faq.q}</span>
                  <FaChevronDown style={{ color: openFaq === i ? ACCENT : 'var(--gray-3)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-2)', color: 'var(--gray-3)', fontSize: '0.95rem', lineHeight: '1.75' }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '16px', padding: '24px', marginBottom: '60px' }}>
          <p style={{ color: '#92400e', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
            ⚠️ <strong>Disclaimer:</strong> Herbal protocols are complementary support systems designed to be integrated under the supervision of a certified oncologist. Cancer Herbalist does not provide alternatives to standard medical regimens, nor does it guarantee specific outcomes. Always review any herbal support plans with your primary care provider.
          </p>
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ 
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #0e2a47 100%)`, 
            borderRadius: '24px', 
            padding: '50px 40px', 
            textAlign: 'center', 
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: ACCENT, filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '16px', lineHeight: 1.3 }}>
              Ready to Integrate <span style={{ color: ACCENT }}>Supportive Care?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, fontSize: '0.98rem', marginBottom: '32px' }}>
              Book a discovery call today to explain your diagnosis and discuss a safe, personalized herbal pathway to support your recovery.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/contact"
                style={{
                  fontSize: '14px',
                  padding: '14px 32px',
                  background: ACCENT,
                  color: 'white',
                  borderRadius: '50px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  boxShadow: `0 8px 24px ${ACCENT}44`,
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${ACCENT}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${ACCENT}44`; }}
              >
                Book Free Consultation <FaArrowRight />
              </Link>
              <a
                href="https://wa.me/918884588835?text=Hi!%20I%20would%20like%20to%20inquire%20about%20herbal%20treatment%20support."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '14px 28px',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.06)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <FaWhatsapp style={{ fontSize: '18px', color: '#25D366' }} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
