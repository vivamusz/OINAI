import React from 'react';
import Illustration from '../../components/Illustration.jsx';

const base=`${import.meta.env.BASE_URL}assets/illustrations/`;
export const friendsImage=`${base}safety-friends.png`;
const cells={fireTruck:0,ambulance:1,police:2,phone:3,smokeSchool:4,teacherWalk:5,earthquake:6,socket:7,matches:8,window:9,mesh:10,teacherTalk:11};
export const stageArt=['fireTruck','phone','teacherWalk','socket','window'];
export const questionArt={
 services:['smokeSchool','ambulance','police'],
 numbers:['fireTruck','ambulance','police','phone'],
 actions:['teacherWalk','earthquake','smokeSchool'],
 safe:['socket','teacherTalk','matches','phone'],
 windows:['window','mesh','window','smokeSchool']
};
export default function SafetyArt({name,className=''}){
 return <Illustration src={`${base}safety-atlas.png`} cell={cells[name]??cells.teacherTalk} columns={4} rows={3} className={className}/>;
}
