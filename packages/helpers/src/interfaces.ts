/**
 * Icon data in JSON format. This package is optimized to handle icons from [Lordicon](https://lordicon.com/).
 */
export type IconData = any;

/**
 * Interface for the object that stores multiple colors.
 * 
 * Example:
 * ```js
 * {
 *     primary: 'red',
 *     secondary: '#ff0000', 
 * }
 * ```
 */
export interface IColors {
    [key: string]: string;
}