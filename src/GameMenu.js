import { useEffect, useState } from "react";

function GameMenu({ inGameSetter }) {
    const [games, setGames] = useState([]);
  
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
      return <button className="bg-red-700 p-4 m-2 rounded-md hover:scale-105 hover:bg-red-600" onClick={e => {
        fetch('/api/createGame',
          {
            method: "POST",
          }
        )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          inGameSetter({playing: true, game: data.game, player: data.user}); // TODO fix data
        });
      }}>Create Game</button>
    }
  
    return (
        <div className="p-4 bg-[url('static/logo.jpg')] bg-cover bg-center bg-no-repeat h-full max-w-2xl relative self-center">
            <p className="text-2xl relative self-center">Don't Drive Off!</p>
            <br />
            <p>Join a game instead :)</p>
        <div className="p-4 m-2 min-height-lvh">
            <CreateGameButton />
            {games.map((g) => (
            <button className="bg-red-900 hover:scale-105 hover:bg-red-800 p-4 m-2 rounded-md" onClick={e => {
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
    )
  }


export default GameMenu;