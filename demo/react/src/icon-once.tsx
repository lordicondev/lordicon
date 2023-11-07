import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react';

const ICON = require('../assets/camera.json');

export default function IconOnce() {    
  const playerRef = useRef<Player>(null);
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return (
        <Player 
            ref={playerRef} 
            size={96}
            icon={ ICON }
            colorize='#08C18A'
        />
    );
}
