import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

const ICON = require('../assets/lock.json');

export default function IconLoop() {    
  const playerRef = useRef<Player>(null);
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return (
        <Player 
            ref={playerRef} 
            style={ styles.player } 
            icon={ ICON }
            onComplete={() => playerRef.current?.playFromBeginning()}
        />
    );
}

const styles = StyleSheet.create({
    player: {
        width: 96,
        height: 96,
    },
});
