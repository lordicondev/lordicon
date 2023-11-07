import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react';

const ICON = require('../assets/lock.json');

export default function IconLoop() {    
  const playerRef = useRef<Player>(null);
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return (
        <Player 
            ref={playerRef} 
            size={96}
            icon={ ICON }
            onComplete={() => playerRef.current?.playFromBeginning()}
        />
    );
}
