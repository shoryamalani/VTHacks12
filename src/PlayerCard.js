
function PlayerCard({ name, score, reason, isYou, parity }) {
    return (
      <div  className={" hover:scale-105 player-card p-4 m-2 drop-shadow-[0_15px_15px_rgba(185,185,185,.25)] h-48 rounded-md " +(parity ? 'col-start-1 ' : 'col-start-3 ') +(isYou ? "bg-[url('static/dither_green.png')] bg-green-900 hover:bg-green-800 ":"bg-[url('static/dither.png')] bg-red-900 hover:bg-red-800 ") +(reason==="" ? 'text-slate-200 ':'text-yellow-400 ')} >
        <div>{name}</div>
        <div>Score: {score}</div>
        <div>Reason: {reason}</div>
      </div>
    );

    // 
    // 
  }

export default PlayerCard;