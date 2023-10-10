# React

This library allows you to easily integrate the playback of [Lordicon](https://lordicon.com/) icons into a React application. This library provides built-in support for both web and native environments.

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

## More examples

For more code samples demonstrating various possibilities, please refer to the 'demo' folder.

## Useful links

- [Lordicon](https://lordicon.com/) - Lordicon is a powerful library of
  thousands of carefully crafted animated icons.
  element.
- [Lottie](https://airbnb.io/lottie) - Render After Effects animations natively
  on Web, Android and iOS, and React Native.