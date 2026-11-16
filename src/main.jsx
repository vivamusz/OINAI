import React,{useState,useEffect,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {ui,games,tr} from './content.js';
import Artwork from './components/Artwork.jsx';
import Dialog from './components/Dialog.jsx';
import SafetyGame from './games/safety/SafetyGame.jsx';
import ProfessionsGame from './games/professions/ProfessionsGame.jsx';
import {text as professionText} from './games/professions/text.js';
import './style.css';
import './storybook.css';
import SafetyArt from './games/safety/SafetyArt.jsx';
function initialLanguage(){try{return localStorage.getItem('oinai-lang')==='ru'?'ru':'kk'}catch{return 'kk'}}
function routeFromHash(){return location.hash==='#/professions'?'professions':location.hash==='#/safety'?'safety':location.hash===''||location.hash==='#/'?'home':'notfound'}
function App(){
 const [lang,setLang]=useState(initialLanguage),[route,setRoute]=useState(routeFromHash),[modal,setModal]=useState(null),[playing,setPlaying]=useState(false),[leaving,setLeaving]=useState(false);
 const u=ui[lang];const onPlaying=useCallback(v=>setPlaying(v),[]);
 useEffect(()=>{document.documentElement.lang=lang;document.title=`OINAI — ${u.tagline}`;try{localStorage.setItem('oinai-lang',lang)}catch{}},[lang,u.tagline]);
 useEffect(()=>{const fn=()=>{setRoute(routeFromHash());setModal(null);setLeaving(false);window.scrollTo(0,0)};window.addEventListener('hashchange',fn);return()=>window.removeEventListener('hashchange',fn)},[]);
 function goHome(){if((route==='safety'||route==='professions')&&playing){setLeaving(true);return;}location.hash='/';}
 const logo=<span className="wordmark" aria-label="OINAI">{'OINAI'.split('').map((c,i)=><span key={i}>{c}</span>)}</span>;
 return <><a className="skip" href="#main-content" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus();}}>{u.jump}</a><header className="topbar"><button className="logo-button" onClick={goHome} aria-label={`OINAI · ${u.home}`}>{logo}</button><span className="top-tagline">{u.tagline}</span><div className="language" role="group" aria-label={u.chooseLanguage}>{['ru','kk'].map(l=><button key={l} lang={l} aria-pressed={lang===l} onClick={()=>setLang(l)}>{l==='kk'?'KZ':'RU'}</button>)}</div></header>
 <div id="main-content" tabIndex={-1}>{route==='home'?<main className="home">
  <section className="hero"><Artwork className="hero-left" rect={[0,0,575,273]}/><div className="hero-center"><h1>{logo}</h1><p>{u.tagline}</p><span>{u.choose}</span></div><Artwork className="hero-yurt" rect={[1340,82,332,191]}/><Artwork className="hero-right" rect={[1090,0,244,273]}/></section>
  <section className="catalog" aria-label={u.games}><div className="game-grid">{games.map((game,i)=><button key={game.id} data-game={game.id} className={`game-card ${game.ready?'ready':''} ${game.id==='professions'?'professions-card':''}`} style={{'--card':game.color}} onClick={()=>game.ready?(location.hash='/'+game.id):setModal({type:'soon',game})}><div className="card-art"><>{game.image?<img src={`${import.meta.env.BASE_URL}${game.image}`} alt=""/>:<Artwork rect={game.rect}/>}</>{game.ready&&<span className="ready-badge">{u.available}</span>}</div><h2>{tr(game.title,lang)}</h2><span className={`card-action ${game.ready?'active':''}`}>{game.ready?`${u.play} →`:u.soon}</span></button>)}</div></section>
  <nav className="bottom-nav" aria-label={u.home}><button className="selected" onClick={goHome}><Artwork rect={[345,560,235,134]}/><span>{u.home}</span></button><button onClick={()=>document.querySelector('.catalog')?.scrollIntoView({behavior:'smooth'})}><Artwork rect={[345,290,235,150]}/><span>{u.games}</span></button><button onClick={()=>setModal({type:'teachers'})}><SafetyArt name="teacherTalk"/><span>{u.teachers}</span></button><button onClick={()=>setModal({type:'about'})}><Artwork rect={[1090,0,244,273]}/><span>{u.about}</span></button></nav>
 </main>:route==='safety'?<SafetyGame lang={lang} onBack={goHome} onPlaying={onPlaying}/>:route==='professions'?<ProfessionsGame lang={lang} onBack={goHome} onPlaying={onPlaying}/>:<main className="panel not-found"><h1>{u.notFound}</h1><button className="primary" onClick={goHome}>{u.home}</button></main>}</div>
 <footer>OINAI · {u.footer}</footer>
 {modal&&<Dialog art={<SafetyArt name="teacherTalk"/>} title={modal.type==='soon'?tr(modal.game.title,lang):modal.type==='teachers'?u.teachers:u.about} close={()=>setModal(null)} label={u.close}><p>{modal.type==='soon'?u.soonText:modal.type==='teachers'?u.teacherText:u.aboutText}</p><button className="primary" onClick={()=>{setModal(null);location.hash='/safety'}}>{u.safety} →</button></Dialog>}
 {leaving&&<Dialog art={<SafetyArt name="teacherTalk"/>} title={u.exitTitle} close={()=>setLeaving(false)} label={u.close}><p>{route==='professions'?professionText[lang].leaveText:u.exitText}</p><div className="dialog-actions"><button className="primary" onClick={()=>setLeaving(false)}>{u.stay}</button><button className="secondary" onClick={()=>{setLeaving(false);location.hash='/'}}>{u.leave}</button></div></Dialog>}
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
