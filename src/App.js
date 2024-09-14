import React from 'react';

// import a divider
import Divider from '@material-ui/core/Divider';
import { Button, Input } from '@mui/material';
import GameScreen from './GameScreen';

// adding a line




function App() {
  // create game button handler
  // show game variable

  const [showGame, setShowGame] = React.useState(false);
  // make this a blank dictionary
  const [currentGame, setCurrentGame] = React.useState([]);
  const [userData, setUserData] = React.useState([]);
  const joinGame = () => {
    console.log('Join Game Button Clicked');
    // run a command to join a game and open the game page
    var url = '/api/joinGame';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        joinCode:  document.getElementById('gameData').value
    })})
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // redirect to the game page
        // window.location.href = '/game/' + data.gameId;
        if(data != null){
          // show the game screen
          setCurrentGame(data.game);
          setUserData(data.user);
          setShowGame(true);
        }else{
          alert("Game not found");
        }
        // show the game screen
        // setShowGame(true);
      });
  }

  const createGame = () => {
    console.log('Create Game Button Clicked');
    // run a command to create a game and open the game page
    var url = '/api/createGame';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // redirect to the game page
        // window.location.href = '/game/' + data.gameId;
        // check if response code is 200
        setUserData(data.user);
        setCurrentGame(data.game);
        console.log("SETTING DATA")
        
        // show the game screen
        setShowGame(true);
      });


  }


  return (
    <div>
{!showGame &&
<>
      <h1>My React App!</h1>
      {/* text input */}
      <Input placeholder="Enter Game ID" id='gameData' />
      <Button onClick={joinGame} variant="contained" color="primary"> Join Game </Button>
      <Divider />

      <Button onClick={createGame} variant="contained" color="primary">
        Create Game
        </Button>
        </>
}
        {/* if statement in react */}
  { showGame &&
        <GameScreen data={currentGame} userData={userData} />
  }


    </div>
  );
}

export default App;