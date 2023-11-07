import { Player } from '@lordicon/react';
import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

const ICON = require('../assets/trash.json');

export default function IconOnce() {    
    const playerRef = useRef<Player>(null);
    const [state, setState] = useState<undefined|string>('in-trash-empty');
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [state]);

    const onClick = () => {
        if (state === 'in-trash-empty') {
            setState('hover-trash-empty');
        } else if (state === 'hover-trash-empty') {
            setState('morph-trash-full');
        } else if (state === 'morph-trash-full') {
            setState('hover-trash-full');
        } else if (state === 'hover-trash-full') {
            setState('morph-trash-full-to-empty');
        } else if (state === 'morph-trash-full-to-empty') {
            setState('hover-trash-empty');
        }
    }

    return (
        <Pressable onPress={onClick} android_ripple={{ color: 'white' }}>
            <Player 
                ref={playerRef} 
                size={96}
                icon={ICON}
                state={state}
            />
        </Pressable>
    );
}
