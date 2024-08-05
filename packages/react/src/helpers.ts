import { deepClone, hexToLottieColor, IColors, IconData, ILottieProperty, isNil, isObjectLike, parseColor, parseColors, readProperties, updateProperties } from "@lordicon/helpers";
import { IPlayerOptions, IState } from "./interfaces";

function findObject(currentData: any, key: string) {
    const result: any[] = [];

    for (const k of Object.keys(currentData)) {
        const v = currentData[k];

        if (isObjectLike(v)) {
            result.push(...findObject(v, key));
        }
    }

    if (currentData.x && typeof currentData.x === 'string' && currentData.x.includes(key)) {
        result.push(currentData);
    }

    return result;
}

function assignColors(data: IconData, properties: ILottieProperty[], value: IColors) {
    for (const colorName of Object.keys(value)) {
        const color = parseColor(value[colorName]);
        const colorObjects = findObject(data, `effect('${colorName}')('Color')`);

        const lottieColor = hexToLottieColor(color);

        // layers
        for (const s of colorObjects) {
            s.k = [...lottieColor, 1];
        }

        // properties
        for (const p of properties) {
            if (p.name === colorName) {
                updateProperties(data, [p], lottieColor);
                p.value = lottieColor;
            }
        }
    }
}

export function handleProps(props: IPlayerOptions) {
    let iconData: any;
    let states: IState[] = [];
    let state: IState | undefined;
    let properties: ILottieProperty[] = [];

    if (props.icon) {
        iconData = deepClone(props.icon);
    }
    
    if (iconData) {
        // read properties
        properties = readProperties(iconData);
        
        // handle states
        states = (iconData.markers || []).map((c: any) => {
            const [partA, partB] = c.cm.split(':');
            const newState: IState = {
                time: c.tm,
                duration: c.dr,
                name: partB || partA,
                default: partB && partA.includes('default') ? true : false,
            };

            if (newState.name === props.state) {
                state = newState;
            } else if (newState.default && isNil(props.state)) {
                state = newState;
            }

            return newState;
        });
        
        // fix states
        if (states.length) {
            const firstState = states[0];
            const lastState = states[states.length - 1];

            // fix animation time
            iconData.ip = firstState.time;
            iconData.op = lastState.time + lastState.duration + 1;
        }

        // assign colors directly to the icon data
        if (props.colors) {
            assignColors(iconData, properties.filter(c => c.type === 'color'), parseColors(props.colors));
        }
    }

    return {
        properties,
        iconData,
        states,
        state,
    };
}