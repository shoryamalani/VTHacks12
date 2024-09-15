import { useEffect, useState } from "react";

function GameMenu({ inGameSetter }) {
    const [games, setGames] = useState([]);
    const [currentGif,setCurrentGif] = useState(require('./static/opening_original_size_single.gif'));
    const [starting, setStarting] = useState(false);
  
    useEffect(() => {
      var url = '/api/getActiveGames';
      fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setGames(data);
        });
    }, []);
  
    function CreateGameButton() {
      return <button className="bg-red-700 p-4 m-2 rounded-md row-start-2 col-start-3 hover:scale-105 hover:bg-red-600" onClick={e => {
        fetch('/api/createGame',
          {
            method: "POST",
          }
        )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setCurrentGif(require('./static/endopen_ordered.gif')); 
          setStarting(true);
          setTimeout(() => {
            inGameSetter({playing: true, game: data.game, player: data.user}); // TODO fix data
          }, 1100);

            
        });
      }}>Create Game</button>
    }
  
    return (
      <div className={"bg-cover bg-center w-full "} style={{backgroundImage:'url(' + currentGif + ')',height:'100svh', }}>
      <div hidden={starting}>
        <div >

      <style>
        {`
          @keyframes rubberBand {
            0% {
              transform: scaleX(1) scaleY(1);
              transform: translateX(-100%);
            }
            30% {
              transform: scaleX(1.25) scaleY(0.75);
            }
            40% {
              transform: scaleX(0.75) scaleY(1.25);
            }
            50% {
              transform: scaleX(1.15) scaleY(0.85);
            }
            65% {
              transform: scaleX(0.95) scaleY(1.05);
            }
            75% {
              transform: scaleX(1.05) scaleY(0.95);
            }
            100% {
              transform: scaleX(1) scaleY(1);
              transform: translateX(0);
            }
          }


          .rubberBand {
          animation: rubberBand 1s ease-in-out;
          }

          .slideInFromLeft {
          animation: slideInFromLeft 1s ease-out;
          }
        `}
      </style>
      <div
        style={{
          padding: '16px', // Equivalent to Tailwind's p-4
          height: '20%', // Equivalent to Tailwind's h-[25%]
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.5s ease-in-out',
          hidden: starting,
        }}
        className="rubberBand rounded-md"
      >
        <img
          src={require("./static/logo.jpg")}
          alt="Logo"
          className="h-[200px] w-[200px]"
        />
      </div>
    </div>
    <div  className="p-4 bg-[rgba(0,0,0,0.8)]  h-[30%] w-[100%] grid grid-cols-5 grid-rows-2 ">
  <p className="text-2xl  self-center row-start-1 row-end-1 col-start-3  row text-white text-center">Don't Drive Off!</p>
  <CreateGameButton className="bg-red-700 w-[1%] p-4 m-2 row-start-2 row-end-2 col-span-1 col-start-3 col-end-3 rounded-md hover:scale-105 hover:bg-red-600" />
  <br />
</div>
        <div  className="p-4 m-2 min-height-lvh grid grid-cols-3 grid-rows-5 ">
            <p className="text-white text-center bg-[rgba(0,0,0,0.8)] row-start-1 col-start-2  align-middle p-4 m-2 rounded-md"> Or Join a game instead :)</p>
            {games.map((g) => (
            <button className={"bg-red-900 hover:scale-105 hover:bg-red-800 p-4 m-2 rounded-md col-span-1 "+ (games.indexOf(g)%2===0 ? 'col-start-1':'col-start-3 ') }   onClick={e => {
                fetch('/api/joinGame', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    joinCode: g[1],
                })
                })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {

                    inGameSetter({playing: true, game: data.game, player: data.user}); // TODO fix data
                });
            }}>Enter Game {g[1]}</button>
            ))}
            </div>
        </div>
      </div>
    )
  }


export default GameMenu;