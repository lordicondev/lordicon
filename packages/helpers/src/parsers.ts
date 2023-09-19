import { COLORS } from './global';
import { IColors } from './interfaces';

/**
 * Return hex color from name.
 * 
 * Example:
 * ```js
 * parseColor('red'); // #ff0000
 * ```
 * 
 * @param colorName Color name.
 * @returns 
 */
export function parseColor(colorName: string): string {
    if (colorName.startsWith('#')) {
        if (colorName.length === 4) {
            // support shorthand
            return `#${colorName[1]}${colorName[1]}${colorName[2]}${colorName[2]}${colorName[3]}${colorName[3]}`;
        } else {
            return colorName;
        }
    } else {
        return COLORS[colorName.toLowerCase()] || '#000000';
    }
}

/**
 * Parse colors attribute.
 * 
 * Example:
 * ```js
 * parseColors('primary:red,secondary:#00ff00'); // { primary: '#ff0000', secondary: '#00ff00' }
 * ```
 * 
 * @param colors Colors definied in string.
 * @returns Object with colors.
 */
export function parseColors(colors: any): IColors | undefined {
    if (!colors || typeof colors !== 'string') {
        return undefined;
    }

    const list = colors.split(',').filter(c => c).map(c => c.split(':')).filter(c => c.length == 2);

    return list.reduce<IColors>((p, c) => {
        const a = c[0];
        p[a.toLowerCase()] = parseColor(c[1]);
        return p;
    }, {});
}

/**
 * Parse stroke attribute to supported range.
 * @param value
 * @returns 
 */
export function parseStroke(value: any): (1 | 2 | 3 | undefined) {
    if (value === 'light' || value === 1 || value === '1') {
        return 1;
    } else if (value === 'regular' || value === 2 || value === '2') {
        return 2;
    } else if (value === 'bold' || value === 3 || value === '3') {
        return 3;
    }

    return undefined;
}

/**
 * Parse state attribute.
 * @param value
 * @returns
 */
export function parseState(value: any): (string | undefined) {
    if (typeof value === 'string') {
        return value;
    }

    return undefined;
}
