import { Player } from '@lordicon/react';
import { useEffect, useRef } from 'react';
import { StyleSheet, Pressable } from 'react-native';

const ICON = require('../assets/lock-alt.json');

export default function IconClick() {    
  const playerRef = useRef<Player>(null);
    return (
        <Pressable onPress= {() => playerRef.current?.playFromBeginning()} android_ripple = {{ color: 'white' }}>
            <Player 
                ref={playerRef} 
                style={ styles.player } 
                icon={ ICON }
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    player: {
        width: 96,
        height: 96,
    },
});
