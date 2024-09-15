import React, { useEffect } from 'react';

function Powerups({ clickable, curUserData, greens, activatePowerup }) {
    const powerUpImages = [require('./static/powerUps/thief.png'), require('./static/powerUps/a_plus.png'), require('./static/powerUps/bathroom.png'), require('./static/powerUps/stealing_oblivious.png')]
    const powerUpNames = ['Devious Meddling', 'Perfectionist', 'Gotta PEE!', 'Attention Grabbing']
    const [powerUpImage, setPowerUpImage] = React.useState(powerUpImages[powerUpNames.indexOf(curUserData[8])]);
    function getPowerUpImage(){
        return powerUpImages[powerUpNames.indexOf(curUserData[8])];
    }

    useEffect(() => {
        setPowerUpImage(getPowerUpImage());
    }, [curUserData]);



    return(
    <div className=" hover:scale-105 player-card col-span-1 h-25 col-start-4 row-start-3  p-3 pt-0 pb-1 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)] bg-[url('static/dither_orange.png')] bg-orange-900 hover:bg-orange-800 text-slate-200" >
            
        <div style={{textAlign:'center'}} >POWERUPS</div>
        {/* progress bar which is a 1-10 grid of boxes where the green background means its done have it in a box with a glow around it*/}
        
        {curUserData[8] && !curUserData[9] &&
        <>
        <div className='flex'>
        <img src={powerUpImage} className='h-20 m-3' />
         <button onClick={activatePowerup} className='p-4 m-3 bg-black' >{curUserData[8]}</button>
         </div>
        </>

         }
        
        <div className=" grid grid-cols-10 grid-rows-1 align-middle p-1 bg-slate-950">
            {
                Array.from({length: 10}, (_, i) => {
                    if(i < greens){
                        return <div className="bg-green-500 p-1 m-1 h-max w-max center" > </div>
                    }
                    else {
                        return <div className="bg-red-500 p-1 m-1 h-max w-max center" > </div>
                    }
                })

            }
        </div>

    </div>
);
}

export default Powerups;