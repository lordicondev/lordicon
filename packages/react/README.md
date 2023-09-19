# react

This library allows you to easily integrate the playback of [Lordicon](https://lordicon.com/) icons into a React application.

## Installation

```bash
$ npm install @lordicon/react
```

## Usage

Sample usage:

```js
import { Player } from '@lordicon/react';

const ICON = require('./assets/lock.json');

export default function Sample() {    
  const playerRef = useRef<Player>(null);
  
  const onPlayPress = () => {
    playerRef.current?.playFromBeginning();
  }

  return (
    <Player 
      ref={playerRef} 
      icon={ ICON }
    />
  );
}
```
