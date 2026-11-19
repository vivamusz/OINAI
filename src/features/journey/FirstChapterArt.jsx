import React from 'react';
import Illustration from '../../components/Illustration.jsx';
export const firstMap=import.meta.env.BASE_URL+'assets/safe-world/route-map.png';
export default function FirstChapterArt({cell}){return <Illustration src={import.meta.env.BASE_URL+'assets/safe-world/story-cards.png'} cell={cell} columns={4} rows={3}/>}
