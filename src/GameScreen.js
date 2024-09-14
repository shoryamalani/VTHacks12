import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from "react-webcam";
// test
function GameScreen(props) {
    // game score
    const [score, setScore] = React.useState(0);
    
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user",
      };
    
    const webcamRef = useRef(null);
    const [img, setImg] = useState(null);
    const [imgAll, setImgAll] = useState([]);
    
    const capture = useCallback(() => {
        var imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
        setImg(imageSrc);
        setImgAll([...imgAll, imageSrc]);
    }, [webcamRef, setImg, imgAll, setImgAll]);
    
        
    useEffect(() => {
        const interval = setInterval(() => {
            capture();
            capture();
            capture();
            capture();
            
            console.log(imgAll);
            if(imgAll.length>3){
                // upload these four images
                var url = '/api/uploadFrames';
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        images:[imgAll[0], imgAll[1], imgAll[2], imgAll[3]],
                        user_id: props.userData[0],
                    })
                })

                setImgAll([]);
                // set timeout to do nothing for a second
                
            }
        }, 250);
        return () => clearInterval(interval);
    }, [imgAll,img]);

    // get game data every second

    useEffect(() => {
        const interval = setInterval(() => {
            var url = '/api/getGameData';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: props.userData[0],
                    gameId: props.userData[1],
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data != null){
                    // show the game screen
                    setScore(data.score);
                }else{
                    alert("Game not found");
                }
            });
        }, 1000);
        return () => clearInterval(interval);
       
    },[]);

    return (
        <div>
            <h1>Game Screen</h1>
            <Webcam
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            audio={false}
            height={640}
            width={480}
            ref={webcamRef}
            mirrored={true}
          /> 
            {props.data &&
            <>
            <p>Share Code: {props.data[1]}</p>
            <p>Score: {score}</p>
            </>
        }   
        </div>
    );
}

export default GameScreen;