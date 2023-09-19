import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

const ICON = require('../assets/camera.json');

export default function IconOnce() {    
  const playerRef = useRef<Player>(null);
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

    return (
        <Player 
            ref={playerRef} 
            style={ styles.player } 
            icon={ ICON }
            colorize='#08C18A'
        />
    );
}

const styles = StyleSheet.create({
    player: {
        width: 96,
        height: 96,
    },
});
