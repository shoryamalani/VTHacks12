import React from 'react';

function PlayerCard({ name, score, reason, isYou, parity }) {
    // taking all of these animals, make a list of required images
    // ['Dog', 'Cat', 'Bird', 'Fish', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Giraffe']
    // the files are in the static folder
    // the files are named <animal>.png
    const files = [require('./static/dog.png'), require('./static/cat.png'), require('./static/bird.png'), require('./static/fish.png'), require('./static/elephant.png'), require('./static/lion.png'), require('./static/tiger.png'), require('./static/bear.png'), require('./static/monkey.png'), require('./static/giraffe.png')];
    const animals = ['Dog', 'Cat', 'Bird', 'Fish', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Giraffe'];
    const [animalFile,setAnimalFile] = React.useState(files[animals.indexOf(name.split(' ')[1]).toString().toLowerCase()]);
    function getComputedImage(){
      // get the index of the animal
      
      return ;

    }
    return (
      <div  className={"hover:scale-105 player-card p-4  drop-shadow-[0_15px_15px_rgba(185,185,185,.25)] h-48 rounded-md col-span-1 " +(parity ? 'col-start-1 mr-11 mt-0 mb-0  ' : 'col-start-4  ml-11') +(isYou ? "bg-[url('static/dither_green.png')] bg-green-900 hover:bg-green-800 ":"bg-[url('static/dither.png')] bg-red-900 hover:bg-red-800 ") +(reason==="" ? 'text-slate-200 ':'text-yellow-400 ')} >
        
        <div className={
          'grid-cols-2 grid grid-rows-2'
        }>
          <div className={"p-2 col-start-1 col-end-1 row-start-1 row-end-1"}>{name}</div>
          <div className={"p-2 col-start-2 col-end-2 row-start-1 row-end-1 text-right"}>{score}</div>
          <div className={'col-start-2 col-end-2 row-start-2 row-end-2 text-right bottom-4 right-4 '}> {reason}</div>
          <img src={animalFile}  className={"col-start-1 col-end-1 row-start-2 row-end-2 h-20"} />
          {/* <img className={"col-start-1 col-end-1 row-start-2 row-end-2"} src={require('./static/lion.png')} /> */}
        </div>

      </div>
          
    );

    // 
    // 
  }

export default PlayerCard;