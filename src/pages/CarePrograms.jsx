import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRibbon, FaLungs, FaAppleAlt, FaHeartbeat, FaRegHospital, FaTint,
  FaArrowRight, FaChevronDown, FaCalendarAlt, FaFileMedical, FaFileSignature,
  FaCapsules, FaUserShield, FaLeaf, FaCheckCircle, FaWhatsapp
} from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const A='#38bed5',AL='#38bed518',AM='#38bed535',AD='#2ca8be',P='#1a6e52';
const up={hidden:{opacity:0,y:32},show:{opacity:1,y:0,transition:{duration:0.6,ease:[0.22,1,0.36,1]}}};
const stg={show:{transition:{staggerChildren:0.1}}};

const CANCERS=['Breast','Lung','Colon','Prostate','Liver','Blood','Cervical','Ovarian','Pancreatic','Thyroid','Bladder','Kidney','Brain','Skin / Melanoma','Bone','Oral','Oesophageal','Uterine','Lymphoma','Myeloma','Testicular','Rectal','Gallbladder','Stomach'];

function Blob({s,x,y,c,d}){
  return <motion.div animate={{y:[0,-18,0],x:[0,8,0],scale:[1,1.06,1]}} transition={{duration:6+d,repeat:Infinity,ease:'easeInOut',delay:d}} style={{position:'absolute',left:x,top:y,width:s,height:s,borderRadius:'50%',background:c,filter:'blur(65px)',opacity:0.16,pointerEvents:'none'}}/>;
}

function CancerScroller(){
  return(
    <div style={{position:'relative',padding:'16px 0',background:'#f8fafc',borderTop:'1px solid #e2e8f0',overflow:'hidden'}}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:80,background:'linear-gradient(90deg,#f8fafc,transparent)',zIndex:2,pointerEvents:'none'}}/>
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:80,background:'linear-gradient(270deg,#f8fafc,transparent)',zIndex:2,pointerEvents:'none'}}/>
      <div className="mq-track" style={{display:'flex',width:'max-content'}}>
        <div className="mq-content" style={{display:'flex',gap:8,paddingRight:8,alignItems:'center'}}>
          {CANCERS.map(n=><span key={n} className="sp"><FaCheckCircle style={{fontSize:10,color:A,flexShrink:0}}/>{n}</span>)}
        </div>
        <div className="mq-content" style={{display:'flex',gap:8,paddingRight:8,alignItems:'center'}}>
          {CANCERS.map(n=><span key={n+'_dup'} className="sp"><FaCheckCircle style={{fontSize:10,color:A,flexShrink:0}}/>{n}</span>)}
        </div>
      </div>
    </div>
  );
}

function Step({step,open,onToggle}){
  return(
    <motion.div whileHover={{scale:1.005}} style={{borderRadius:16,border:`1.5px solid ${open?A:'#e2e8f0'}`,overflow:'hidden',background:'#fff',boxShadow:open?`0 8px 32px ${AL}`:'none',transition:'border-color 0.2s,box-shadow 0.2s'}}>
      <button onClick={onToggle} style={{width:'100%',background:open?AL:'transparent',border:'none',padding:'18px 20px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',textAlign:'left'}}>
        <span style={{width:36,height:36,borderRadius:'50%',background:open?A:'#f1f5f9',color:open?'#fff':'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0,transition:'all 0.2s'}}>{step.num}</span>
        <span style={{flex:1,fontSize:15,fontWeight:700,color:open?A:'#0f172a',fontFamily:'Poppins,sans-serif'}}>{step.title}</span>
        <motion.span animate={{rotate:open?180:0}} transition={{duration:0.25}} style={{color:open?A:'#94a3b8',fontSize:13}}><FaChevronDown/></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open&&<motion.div key="c" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.28}} style={{overflow:'hidden'}}>
          <div style={{padding:'0 20px 20px 70px',display:'flex',gap:12}}>
            <span style={{color:A,fontSize:18,flexShrink:0,marginTop:2}}>{step.icon}</span>
            <p style={{color:'#64748b',fontSize:14,lineHeight:'1.75',margin:0}}>{step.desc}</p>
          </div>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CarePrograms(){
  const { content } = useContent();
  const [open,setOpen]=useState(0);

  // Dynamic values
  const careProgramsHero = content?.careProgramsHero || {};
  const careProgramsList = content?.careProgramsList || [];
  const careProgramsSteps = content?.careProgramsSteps || [];

  const staticServicesIcons = [
    <FaRibbon key={0}/>, <FaLungs key={1}/>, <FaAppleAlt key={2}/>, <FaHeartbeat key={3}/>, <FaRegHospital key={4}/>, <FaTint key={5}/>
  ];

  const staticStepsIcons = [
    <FaCalendarAlt key={0}/>, <FaFileMedical key={1}/>, <FaFileSignature key={2}/>, <FaCapsules key={3}/>, <FaUserShield key={4}/>
  ];

  const activeServices = careProgramsList.map((svc, i) => ({
    ...svc,
    icon: staticServicesIcons[i % staticServicesIcons.length]
  }));

  const activeSteps = careProgramsSteps.map((step, i) => ({
    ...step,
    icon: staticStepsIcons[i % staticStepsIcons.length]
  }));

  return(
    <div style={{background:'#fff',minHeight:'100vh'}}>

      {/* ── HERO ── */}
      <section style={{background:`linear-gradient(135deg,${P} 0%,#0f3460 100%)`,padding:'clamp(100px,14vw,140px) 20px clamp(60px,8vw,90px)',position:'relative',overflow:'hidden',textAlign:'center',color:'#fff'}}>
        <Blob s={420} x="-120px" y="-120px" c={A} d={0}/>
        <Blob s={300} x="65%" y="20%" c="#7c3aed" d={2}/>
        <Blob s={240} x="5%" y="55%" c={P} d={4}/>
        {[...Array(9)].map((_,i)=>(
          <motion.div key={i} animate={{y:[-14,14,-14],rotate:[0,180,360],opacity:[0.08,0.18,0.08]}} transition={{duration:4+i,repeat:Infinity,delay:i*0.6}} style={{position:'absolute',left:`${(i*13)%94}%`,top:`${(i*11)%88}%`,color:A,fontSize:8+i*2,zIndex:1,pointerEvents:'none'}}><FaLeaf/></motion.div>
        ))}
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.7}} style={{position:'relative',zIndex:2,maxWidth:720,margin:'0 auto'}}>
          <motion.span initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.2}} style={{display:'inline-flex',alignItems:'center',gap:7,background:`${A}30`,border:`1px solid ${A}60`,color:A,padding:'6px 18px',borderRadius:50,fontSize:12,fontWeight:700,letterSpacing:'0.5px',marginBottom:22}}>
            <FaLeaf/> {careProgramsHero.badge || 'Our Care Programs'}
          </motion.span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,5.5vw,3.4rem)',fontWeight:900,lineHeight:1.15,marginBottom:18}}>
            {careProgramsHero.title || 'Specialized Herbal Care'}{' '}
            <span style={{color:A}}>{careProgramsHero.titleAccent || '& Your Healing Journey'}</span>
          </h1>
          <p style={{opacity:0.85,fontSize:'clamp(0.9rem,2.5vw,1.05rem)',lineHeight:1.85,maxWidth:560,margin:'0 auto 32px'}}>
            {careProgramsHero.subline || 'Evidence-based herbal support for every cancer type...'}
          </p>
          <motion.a whileHover={{scale:1.04}} href="#how-we-treat" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.12)',color:'#fff',padding:'14px 30px',borderRadius:50,fontWeight:600,textDecoration:'none',fontSize:14,border:'1px solid rgba(255,255,255,0.3)',backdropFilter:'blur(10px)'}}>
            See Our 5-Step Process
          </motion.a>
        </motion.div>
        <div style={{position:'absolute',bottom:-1,left:0,right:0,zIndex:2}}>
          <svg viewBox="0 0 1440 60" style={{display:'block',width:'100%'}}><path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#fff"/></svg>
        </div>
      </section>

      {/* ── PROGRAMS — Split Layout ── */}
      <section style={{background:'#fff',padding:'clamp(52px,8vw,90px) 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 20px'}}>
          <motion.div initial="hidden" whileInView="show" variants={stg} viewport={{once:true}} style={{textAlign:'center',marginBottom:48}}>
            <motion.div variants={up}>
              <span style={{display:'inline-flex',alignItems:'center',gap:7,background:`${A}15`,border:`1px solid ${A}33`,color:A,padding:'6px 16px',borderRadius:50,fontSize:12,fontWeight:700,marginBottom:14}}><FaHeartbeat/> Condition-Specific Support</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.4rem)',color:'#0f172a',fontWeight:900,marginBottom:12}}>Featured <span style={{color:A}}>Care Programs</span></h2>
              <p style={{color:'#64748b',fontSize:'0.97rem',lineHeight:1.8,maxWidth:520,margin:'0 auto'}}>Highlighted programs from our practice — our support extends to <strong style={{color:'#0f172a'}}>every known cancer type</strong>.</p>
            </motion.div>
          </motion.div>

          {/* 2-col split: dark panel + list */}
          <div className="cp-split">
            {/* Left dark panel */}
            <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6}} className="cp-panel">
              <div style={{position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:A,filter:'blur(70px)',opacity:0.15,pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:-40,left:-40,width:160,height:160,borderRadius:'50%',background:'#7c3aed',filter:'blur(60px)',opacity:0.12,pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:60,fontFamily:'Georgia,serif',color:A,opacity:0.25,lineHeight:1,marginBottom:16,userSelect:'none'}}>Rx</div>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.4rem,3vw,2rem)',color:'#fff',fontWeight:900,lineHeight:1.3,marginBottom:16}}>
                  Personalised herbal care for <span style={{color:A}}>every cancer</span>
                </h3>
                <p style={{color:'rgba(255,255,255,0.7)',fontSize:14,lineHeight:1.8,marginBottom:28}}>Each program is tailored by Prof. Ramesh to your specific cancer type, stage, and medical history.</p>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {['Evidence-based protocols','No drug-herb conflicts','Complementary to chemo','Weekly follow-up included'].map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:10,color:'rgba(255,255,255,0.85)',fontSize:13}}>
                      <FaCheckCircle style={{color:A,fontSize:12,flexShrink:0}}/>{f}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: program list */}
            <motion.div variants={stg} initial="hidden" whileInView="show" viewport={{once:true,amount:0.05}} style={{display:'flex',flexDirection:'column',gap:12}}>
              {activeServices.map(svc=>(
                <motion.div key={svc.slug} variants={up} whileHover={{x:6}} style={{display:'flex',alignItems:'center',gap:16,background:'#fff',borderRadius:16,padding:'16px 18px',border:`1.5px solid ${AM}`,boxShadow:'0 2px 12px rgba(0,0,0,0.04)',transition:'box-shadow 0.2s',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:-30,right:-30,width:80,height:80,borderRadius:'50%',background:A,filter:'blur(35px)',opacity:0.07,pointerEvents:'none'}}/>
                  <div style={{width:46,height:46,borderRadius:13,background:`linear-gradient(135deg,${A},${AD})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',flexShrink:0,boxShadow:`0 6px 16px ${A}44`}}>{svc.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:3,fontFamily:'Poppins,sans-serif'}}>{svc.title}</div>
                    <div className="cp-desc" style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>{svc.desc}</div>
                  </div>
                  <Link to={`/services/${svc.slug}`} style={{flexShrink:0,width:34,height:34,borderRadius:'50%',background:AL,border:`1.5px solid ${AM}`,display:'flex',alignItems:'center',justifyContent:'center',color:A,textDecoration:'none',fontSize:12}}>
                    <FaArrowRight/>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ALL CANCERS ── */}
      <section style={{background:'#f8fafc',borderTop:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0'}}>
        <motion.div initial="hidden" whileInView="show" variants={stg} viewport={{once:true}} style={{textAlign:'center',padding:'clamp(52px,8vw,80px) 20px 36px'}}>
          <motion.div variants={up}>
            <span style={{display:'inline-flex',alignItems:'center',gap:7,background:`${A}15`,border:`1px solid ${A}33`,color:A,padding:'6px 16px',borderRadius:50,fontSize:12,fontWeight:700,marginBottom:16}}><FaLeaf/> Complete Cancer Coverage</span>
            <motion.div animate={{opacity:[0.2,1,0.2],scale:[1,1.05,1]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}} style={{fontSize:'clamp(64px,14vw,96px)',lineHeight:0.85,color:A,fontFamily:'Georgia,serif',marginBottom:16,userSelect:'none'}}>&#8734;</motion.div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.4rem)',color:'#0f172a',fontWeight:900,marginBottom:14}}>We treat <span style={{color:A}}>every</span> type of cancer</h2>
            <p style={{color:'#64748b',fontSize:'0.97rem',lineHeight:1.8,maxWidth:560,margin:'0 auto'}}>
              Whether common or rare, Prof. Ramesh&apos;s team creates a personalised herbal pathway for <strong style={{color:'#0f172a'}}>every known cancer type</strong> — no case is ever turned away.
            </p>
          </motion.div>
        </motion.div>
        <CancerScroller/>
      </section>

      {/* ── STEPS ── */}
      <section id="how-we-treat" style={{background:`linear-gradient(180deg,${AL} 0%,#fff 55%)`,padding:'clamp(52px,8vw,90px) 20px'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          <motion.div initial="hidden" whileInView="show" variants={stg} viewport={{once:true}} style={{textAlign:'center',marginBottom:40}}>
            <motion.div variants={up}>
              <span style={{display:'inline-flex',alignItems:'center',gap:7,background:`${A}15`,border:`1px solid ${A}33`,color:A,padding:'6px 16px',borderRadius:50,fontSize:12,fontWeight:700,marginBottom:14}}><FaFileMedical/> How We Support You</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.4rem)',color:'#0f172a',fontWeight:900,marginBottom:12}}>Your Healing <span style={{color:A}}>Journey</span></h2>
              <p style={{color:'#64748b',fontSize:'0.97rem',lineHeight:1.8,maxWidth:460,margin:'0 auto'}}>A structured 5-step process from first contact to full recovery. Tap each step to learn more.</p>
            </motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" variants={stg} viewport={{once:true,amount:0.05}} style={{display:'flex',flexDirection:'column',gap:10}}>
            {activeSteps.map((step,i)=>(
              <motion.div key={step.num || i} variants={up}>
                <Step step={step} open={open===i} onToggle={()=>setOpen(open===i?-1:i)}/>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: `linear-gradient(135deg, ${P} 0%, #0e2a47 100%)`, padding: 'clamp(110px, 12vw, 150px) 20px clamp(60px, 8vw, 90px)', position: 'relative', overflow: 'hidden' }}>
        {/* Top Curve */}
        <div style={{ position: 'absolute', top: -1, left: 0, right: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 60" style={{ display: 'block', width: '100%', transform: 'rotate(180deg)' }}><path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#fff" /></svg>
        </div>

        <Blob s={350} x="80%" y="-100px" c={A} d={1} />
        <Blob s={280} x="-100px" y="30%" c={P} d={3} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              padding: '50px 40px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Glowing Icon Circle */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${A}20, ${A}40)`,
                border: `1px solid ${A}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: A,
                fontSize: '24px',
                boxShadow: `0 8px 24px ${A}33`,
              }}
            >
              <FaLeaf />
            </div>

            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 900, marginBottom: '14px', lineHeight: 1.25 }}>
              Ready to Begin Your <span style={{ color: A }}>Healing Journey?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: 'clamp(14px, 1.8vw, 15px)', maxWidth: '520px', margin: '0 auto 36px' }}>
              Speak with Prof. Ramesh Babu or one of our senior practitioners today. Let us guide you through a personalized, integrative pathway to recovery.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/contact"
                style={{
                  fontSize: '14px',
                  padding: '14px 32px',
                  background: A,
                  color: 'white',
                  borderRadius: '50px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  boxShadow: `0 8px 24px ${A}44`,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${A}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${A}44`; }}
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
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = A; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <FaWhatsapp style={{ fontSize: '18px', color: '#25D366' }} /> Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        .cp-split{display:grid;grid-template-columns:1fr;gap:24px}
        @media(min-width:768px){.cp-split{grid-template-columns:340px 1fr;gap:32px;align-items:start}}
        @media(min-width:1100px){.cp-split{grid-template-columns:380px 1fr}}
        .cp-panel{background:linear-gradient(135deg,${P} 0%,#0f3460 100%);border-radius:24px;padding:36px 32px;position:relative;overflow:hidden}
        .cp-desc{}
        @media(max-width:400px){.cp-desc{display:none}}
        .mq-track{animation:marquee 28s linear infinite;display:flex}
        .mq-content{flex-shrink:0}
        @keyframes marquee{
          0%{transform:translate3d(0,0,0)}
          100%{transform:translate3d(-50%,0,0)}
        }
        .sp{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;white-space:nowrap;flex-shrink:0;border:1.5px solid #e2e8f0;background:#fff;color:#334155;transition:all 0.2s;cursor:default}
        .sp:hover{border-color:${A};color:${A};background:${AL}}
        @media(max-width:480px){.sp{font-size:12px;padding:6px 12px}}
      `}</style>
    </div>
  );
}
