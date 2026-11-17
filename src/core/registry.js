export const games=[
 ['counting','Санап үйрен','Учимся считать','#ecd5ff'],['shapes','Пішіндер','Фигуры','#fff1ac'],['colors','Түстер','Цвета','#ffd7ed'],['memory','Жұбын тап','Найди пару','#c8f0ff'],['animals','Жануарлар','Животные','#d8f5b4'],['patterns','Заңдылықты тап','Продолжи ряд','#ffe2b9'],['safety','ТЖ кезіндегі әрекеттер','Действия при ЧС','#cbeeff'],['yurt','Киіз үйдің құрылысы','Устройство юрты','#ebd8ff'],['food','Ұлттық тағамдар','Национальные блюда','#ffd8de'],['seasons','Жыл мезгілдері','Времена года','#e3f7b2'],['birds','Үй құстары мен жабайы құстар','Домашние и дикие птицы','#d1eeff'],['wildlife','Үй жануарлары мен жабайы жануарлар','Домашние и дикие животные','#f3d8fa']
].map(([id,kk,ru,color],index)=>({id,title:{kk,ru},color,ready:id==='safety'||id==='yurt',rect:[[50,345,598,850,1100,1355][index%6],index<6?290:560,[278,235,236,232,232,267][index%6],index<6?150:134]}));

games.splice(7,0,{id:'professions',title:{kk:'Мамандықтар',ru:'Профессии'},color:'#ffe4a8',ready:true,image:'assets/professions/hero-city-map.jpg'});


export const playableGames=games.filter(game=>game.ready);
export function routeFromHash(hash){
 if(hash===''||hash==='#/')return 'home';
 if(hash==='#/journeys/safe-world')return 'safe-world';
 const id=hash.startsWith('#/')?hash.slice(2):null;
 return playableGames.some(game=>game.id===id)?id:'notfound';
}
