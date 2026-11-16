import answerArt from './answer-art.json';
export {answerArt};
export const asset=path=>`${import.meta.env.BASE_URL}assets/professions/${path.split('/').pop()}`;
export const portrait=id=>`${({fire:'firefighter',salon:'hairdresser'})[id]||id}-person.png`;

export const choiceImage=path=>{const name=path.split('/').pop();return /^answer-(firefighter|doctor|teacher|chef|builder|police|hairdresser)\.png$/.test(name)?name.replace('answer-','').replace('.png','-person.png'):path;};
