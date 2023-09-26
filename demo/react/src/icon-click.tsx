import { Player } from '@lordicon/react';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

const ICON = require('../assets/lock-alt.json');

export default function IconClick() {    
    const playerRef = useRef<Player>(null);
    const [direction, setDirection] = useState<1|-1>(-1);
    
    useEffect(() => {
        playerRef.current?.play();
    }, [direction]);

    const onIconClick = () => {
        setDirection(direction === 1 ? -1 : 1);
    }

    return (
        <Pressable  onPress={onIconClick} android_ripple = {{ color: 'white' }}>
            <Player 
                ref={playerRef} 
                style={styles.player} 
                icon={ICON}
                direction={direction}
                state="morph-unlocked"
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
