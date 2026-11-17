import React,{useState} from 'react';
import {playableGames} from '../../core/registry.js';
import {passports} from '../../content/passports.js';
import SafetyArt from '../../games/safety/SafetyArt.jsx';
import './teacher.css';
const labels={
 kk:{choose:'Ойынды таңдаңыз',title:'Ойын паспорты',age:'Ұсынылатын жас',years:'жас',goal:'Мақсат',scope:'Тапсырмалар',format:'Өткізу түрі',steps:'Қалай өткіземіз',outcome:'Бақылауға болатын нәтиже',materials:'Қажетті құралдар',adaptation:'Балаға қолдау',offlineFollowUp:'Ойыннан кейін',safety:'Қауіпсіздік',start:'Ойынды бастау',print:'Басып шығару',review:'Әдістемелік мәтін тексерілуде. Жас — ұсыныс; тапсырманы балаға қарай таңдаңыз.'},
 ru:{choose:'Выберите игру',title:'Паспорт игры',age:'Рекомендуемый возраст',years:'лет',goal:'Цель',scope:'Задания',format:'Формат',steps:'Как провести',outcome:'Что можно наблюдать',materials:'Материалы',adaptation:'Поддержка ребёнка',offlineFollowUp:'После игры',safety:'Безопасность',start:'Начать игру',print:'Распечатать',review:'Методический текст на проверке. Возраст — рекомендация; подбирайте задания по силам ребёнка.'}
};
export default function TeacherPanel({lang,onStart}){
 const [id,setId]=useState(playableGames[0].id),u=labels[lang],game=playableGames.find(g=>g.id===id),passport=passports[id];
 return <div className="teacher-panel"><nav className="teacher-tabs" aria-label={u.choose}>{playableGames.map(g=><button key={g.id} aria-pressed={id===g.id} onClick={()=>setId(g.id)}>{g.title[lang]}</button>)}</nav>
 <article className="game-passport" lang={lang}><div className="passport-cover">{game.id==='safety'?<SafetyArt name="teacherTalk"/>:<img src={`${import.meta.env.BASE_URL}${game.image||'assets/yurt/cutaway.png'}`} alt=""/>}<div><p>OINAI · {u.title}</p><h3>{game.title[lang]}</h3><p>{u.age}: {passport.age} {u.years}</p></div></div>
 <p className="passport-review">{u.review}</p><dl>{['goal','scope','format','steps','outcome','materials','adaptation','offlineFollowUp','safety'].map(key=><div key={key}><dt>{u[key]}</dt><dd>{passport[key][lang]}</dd></div>)}</dl></article>
 <div className="passport-actions"><button className="primary" onClick={()=>onStart(id)}>{u.start} →</button><button className="secondary" onClick={()=>window.print()}>{u.print}</button></div></div>;
}
