import { isObjectLike, parseColors, parseState, parseStroke } from '@lordicon/helpers';
import { IPlayer, ITrigger, ITriggerConstructor, IconData, IconLoader, PlayerFactory } from './interfaces';

/**
 * Supported icon loading strategies for our {@link Element | Element}.
 */
export type LoadingType = 'lazy' | 'interaction' | 'delay';

/**
 * Use constructable stylesheets if supported (https://developers.google.com/web/updates/2019/02/constructable-stylesheets)
 */
const SUPPORTS_ADOPTING_STYLE_SHEETS = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;

/**
 * List of events supported for intersection loading.
 */
const INTERSECTION_LOADING_EVENTS = ['click', 'mouseenter', 'mouseleave'];

/**
 * Static style for this element.
 */
const ELEMENT_STYLE = `
    :host {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 32px;
        transform: translate3d(0px, 0px, 0px);
    }

    :host(.current-color) svg path[fill] {
        fill: currentColor;
    }

    :host(.current-color) svg path[stroke] {
        stroke: currentColor;
    }

    svg {
        position: absolute;
        pointer-events: none;
        display: block;
        transform: unset!important;
    }

    ::slotted(*) {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .body.ready ::slotted(*) {
        display: none;
    }
`;

/**
 * Current style sheet instance (if supported).
 */
let styleSheet: CSSStyleSheet;

/**
 * Supported attributes for this custom element.
 */
type SUPPORTED_ATTRIBUTES = |
    "colors" |
    "src" |
    "icon" |
    "state" |
    "trigger" |
    "loading" |
    "target" |
    "stroke";

/**
 * Observed attributes for this custom element.
 */
const OBSERVED_ATTRIBUTES: SUPPORTED_ATTRIBUTES[] = [
    "colors",
    "src",
    "icon",
    "state",
    "trigger",
    "loading",
    "target",
    "stroke",
];

/**
 * Define custom element and a player to streamline the rendering, customization, and easy control of Lordicon icons.
 * 
 * Example:
 * ```js
 * import lottie from 'lottie-web';
 * import { Element, Player } from '@lordicon/element';
 * 
 * Element.setPlayerFactory((container, iconData, initial) => {
 *     return new Player(
 *         lottie.loadAnimation,
 *         container,
 *         iconData,
 *         initial,
 *     );
 * });
 * 
 * customElements.define("lord-icon", Element);
 * ```
 * 
 * Notice: you can define this custom element, a lot easier with premade helper method: {@link index.defineElement | defineElement}.
 */
export class Element<P extends IPlayer = IPlayer> extends HTMLElement {
    protected static _iconLoader?: IconLoader;
    protected static _playerFactory?: PlayerFactory;
    protected static _definedTriggers: Map<string, ITriggerConstructor> = new Map<string, ITriggerConstructor>();

    /**
     * Get the current element version.
     */
    static get version() {
        return '__BUILD_VERSION__';
    }

    /**
     * Observed attributes for the custom element.
     */
    static get observedAttributes() {
        return OBSERVED_ATTRIBUTES;
    }

    /**
     * Assign a callback responsible for loading icons. This allows {@link element.Element | Element} to load {@link interfaces.IconData | icon data} from a custom source.
     * Remember to assign the _icon loader_ before defining the `lord-icon` custom element to take effect.
     * 
     * Example:
     * ```js
     * import lottie from 'lottie-web';
     * import { defineElement, Element } from '@lordicon/element';
     * 
     * Element.setIconLoader(async (name) => {
     *     const response = await fetch(`https://example.com/${name}.json`);
     *     return await response.json();
     * });
     * 
     * defineElement(lottie.loadAnimation);
     * ```
     * 
     * @param loader Custom icon loader callback.
     */
    static setIconLoader(loader: IconLoader) {
        Element._iconLoader = loader;
    }

    /**
     * Assign a callback that creates a player. The player is responsible for customizing icons and playing animations.
     * @param loader
     */
    static setPlayerFactory(loader: PlayerFactory) {
        Element._playerFactory = loader;
    }

    /**
     * Define a supported trigger. Triggers allow the definition of custom interaction strategies for the icon.
     * @param name Trigger name.
     * @param triggerClass Trigger class.
     */
    static defineTrigger(name: string, triggerClass: ITriggerConstructor) {
        Element._definedTriggers.set(name, triggerClass);
    }

    protected _root?: ShadowRoot;
    protected _isConnected: boolean = false;
    protected _isReady: boolean = false;
    protected _assignedIconData?: IconData;
    protected _loadedIconData?: IconData;
    protected _triggerInstance?: ITrigger;
    protected _playerInstance?: IPlayer;

    /**
     * Callback created by one of the lazy loading methods.
     * It forces the process to continue immediately.
     */
    delayedLoading: ((cancel?: boolean) => void) | null = null;

    /**
     * Handle attribute updates.
     * @param name
     * @param oldValue
     * @param newValue
     */
    protected attributeChangedCallback(
        name: SUPPORTED_ATTRIBUTES,
        oldValue: any,
        newValue: any
    ) {
        this[`${name}Changed`].call(this);
    }

    /**
     * The element is connected.
     */
    protected connectedCallback() {
        // create elements only once
        if (!this._root) {
            this.createElements();
        }

        if (this.loading === 'lazy') {
            let intersectionObserver: IntersectionObserver | undefined = undefined;

            this.delayedLoading = (cancel?: boolean) => {
                intersectionObserver!.unobserve(this);
                intersectionObserver = undefined;
                this.delayedLoading = null;

                if (!cancel) {
                    this.createPlayer();
                }
            };

            const callback: IntersectionObserverCallback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && intersectionObserver) {
                        if (this.delayedLoading) {
                            this.delayedLoading();
                        }
                    }
                });
            };
            intersectionObserver = new IntersectionObserver(callback);
            intersectionObserver.observe(this);
        } else if (this.loading === 'interaction') {
            let interactionEvent: string | undefined = undefined;

            this.delayedLoading = (cancel?: boolean) => {
                for (const eventName of INTERSECTION_LOADING_EVENTS) {
                    (targetElement || this).removeEventListener(eventName, intersectionCallback);
                }
                this.delayedLoading = null;

                if (!cancel) {
                    this.createPlayer().then(() => {
                        if (interactionEvent) {
                            (targetElement || this).dispatchEvent(new Event(interactionEvent));
                        }
                    });
                }
            };

            const targetElement = this.target ? this.closest<HTMLElement>(this.target) : null;

            let intersectionCallback: (this: Element, event: Event) => void = (event: Event) => {
                const eventName = event?.type;

                if (!interactionEvent) {
                    interactionEvent = eventName;
                    if (this.delayedLoading) {
                        this.delayedLoading();
                    }
                } else {
                    interactionEvent = eventName;
                }
            }

            intersectionCallback = intersectionCallback.bind(this);

            // load on interaction
            for (const eventName of INTERSECTION_LOADING_EVENTS) {
                (targetElement || this).addEventListener(eventName, intersectionCallback);
            }
        } else if (this.loading === 'delay') {
            this.delayedLoading = (cancel?: boolean) => {
                this.delayedLoading = null;

                if (!cancel) {
                    this.createPlayer();
                }
            };

            // delay time
            const delay = this.hasAttribute('delay') ? +this.getAttribute('delay')! : 0;

            // delay loading
            setTimeout(() => {
                if (this.delayedLoading) {
                    this.delayedLoading();
                }
            }, delay);
        } else {
            this.createPlayer();
        }

        this._isConnected = true;
    }

    /**
     * The element is disconnected.
     */
    protected disconnectedCallback() {
        // clean state from delayed loading
        if (this.delayedLoading) {
            this.delayedLoading(true);
        }

        // remove player
        this.destroyPlayer();

        this._isConnected = false;
    }

    /**
     * Create DOM elements.
     */
    protected createElements() {
        // create shadow root for this element
        this._root = this.attachShadow({
            mode: "open"
        });

        if (SUPPORTS_ADOPTING_STYLE_SHEETS) {
            if (!styleSheet) {
                styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(ELEMENT_STYLE);
            }

            this._root.adoptedStyleSheets = [styleSheet];
        } else {
            const style = document.createElement("style");
            style.innerHTML = ELEMENT_STYLE;
            this._root.appendChild(style);
        }

        // create container
        const container = document.createElement("div");
        container.classList.add('body');
        this._root.appendChild(container);

        // create slot
        const slot = document.createElement("slot");
        container.appendChild(slot);
    }

    /**
     * Instantiate a player instance on demand using the assigned player factory.
     * @returns
     */
    protected async createPlayer(): Promise<void> {
        // notify about missing loader
        if (!Element._playerFactory) {
            throw new Error('Missing player loader!');
        }

        // we are already on lazy loading process
        if (this.delayedLoading) {
            return;
        }

        const iconData = await this.loadIconData();
        if (!iconData) {
            return;
        }

        // create player instance
        this._playerInstance = Element._playerFactory(
            this.animationContainer!,
            iconData,
            {
                state: parseState(this.state),
                stroke: parseStroke(this.stroke),
                colors: parseColors(this.colors),
                // legacy properties
                scale: parseFloat('' + this.getAttribute('scale') || ''),
                axisX: parseFloat('' + this.getAttribute('axis-x') || ''),
                axisY: parseFloat('' + this.getAttribute('axis-y') || ''),
            },
        );

        // dynamic style for colors
        const colors = Object.entries(this._playerInstance!.colors || {});
        if (colors.length) {
            let styleContent = '';

            for (const [key, value] of colors) {
                styleContent += `
                    :host(:not(.current-color)) svg path[fill].${key} {
                        fill: var(--lord-icon-${key}, var(--lord-icon-${key}-base, #000));
                    }
        
                    :host(:not(.current-color)) svg path[stroke].${key} {
                        stroke: var(--lord-icon-${key}, var(--lord-icon-${key}-base, #000));
                    }
                `
            }

            const style = document.createElement("style");
            style.innerHTML = styleContent;
            this.animationContainer!.appendChild(style);
        }

        // connect after style
        this._playerInstance.connect();

        // listen for ready
        this._playerInstance.addEventListener('ready', () => {
            if (this._triggerInstance && this._triggerInstance.onReady) {
                this._triggerInstance.onReady();
            }
        });

        // listen for refresh
        this._playerInstance.addEventListener('refresh', () => {
            this.refresh();

            if (this._triggerInstance && this._triggerInstance.onRefresh) {
                this._triggerInstance.onRefresh();
            }
        });

        // listen for complete
        this._playerInstance.addEventListener('complete', () => {
            if (this._triggerInstance && this._triggerInstance.onComplete) {
                this._triggerInstance.onComplete();
            }
        });

        // listen for frame
        this._playerInstance.addEventListener('frame', () => {
            if (this._triggerInstance && this._triggerInstance.onFrame) {
                this._triggerInstance.onFrame();
            }
        });

        // refresh element instantly
        this.refresh();

        // create trigger (only if assigned)
        this.triggerChanged();

        // wait for player ready
        await new Promise<void>((resolve, reject) => {
            if (this._playerInstance!.isReady) {
                resolve();
            } else {
                this._playerInstance!.addEventListener('ready', resolve);
            }
        });

        // mark ready
        this._isReady = true;

        // notify about ready
        this.dispatchEvent(new CustomEvent("ready"));
    }

    /**
     * Destroy connected player and connected trigger. 
     * The player is recreated every time the icon data changes.
     */
    protected destroyPlayer() {
        // mark not ready
        this._isReady = false;

        // clear stored icon data
        this._loadedIconData = undefined;

        // remove trigger
        if (this._triggerInstance) {
            if (this._triggerInstance.onDisconnected) {
                this._triggerInstance.onDisconnected();
            }
            this._triggerInstance = undefined;
        }

        // remove player
        if (this._playerInstance) {
            this._playerInstance.disconnect();
            this._playerInstance = undefined;
        }
    }

    /**
     * Load the icon using the assigned icon loader or from the source indicated by the 'src' attribute.
     * @returns Icon data.
     */
    protected async loadIconData(): Promise<IconData> {
        let iconData = this.iconData;

        if (!iconData) {
            if (this.icon && Element._iconLoader) {
                this._loadedIconData = iconData = await Element._iconLoader(this.icon);
            } else if (this.src) {
                const response = await fetch(this.src);
                this._loadedIconData = iconData = await response.json();
            }
        }

        return iconData;
    }

    /**
     * Synchronize the element's state with the player.
     */
    protected refresh() {
        this.movePaletteToCssVariables();
    }

    /**
     * Update defaults for CSS variables.
     * Notice: CSS variables take precedence over colors assigned by other methods.
     */
    protected movePaletteToCssVariables() {
        for (const [key, value] of Object.entries(this._playerInstance!.colors || {})) {
            if (value) {
                this.animationContainer!.style.setProperty(`--lord-icon-${key}-base`, value);
            } else {
                this.animationContainer!.style.removeProperty(`--lord-icon-${key}-base`);
            }
        }
    }

    /**
     * The 'target' attribute has been changed. The element should now reload its trigger.
     */
    protected targetChanged() {
        this.triggerChanged();
    }

    /**
     * The 'loading' attribute has been changed.
     */
    protected loadingChanged() {
    }

    /**
     * The 'trigger' attribute has been changed. Disconnect the old trigger and instantiate the new one.
     */
    protected triggerChanged(): void {
        if (this._triggerInstance) {
            if (this._triggerInstance.onDisconnected) {
                this._triggerInstance.onDisconnected();
            }
            this._triggerInstance = undefined;

            this._playerInstance?.pause();
        }

        if (!this.trigger || !this._playerInstance) {
            return;
        }

        const TriggerClass = Element._definedTriggers.get(this.trigger);
        if (!TriggerClass) {
            throw new Error(`Can't use unregistered trigger!`)
        }

        const targetElement = this.target ? this.closest<HTMLElement>(this.target) : null;

        this._triggerInstance = new TriggerClass(
            this._playerInstance,
            this,
            targetElement || this,
        );

        if (this._triggerInstance.onConnected) {
            this._triggerInstance.onConnected();
        }

        if (this._playerInstance.isReady && this._triggerInstance.onReady) {
            this._triggerInstance.onReady();
        }
    }

    /**
     * The 'colors' attribute has been changed. Notify the player about the new value.
     */
    protected colorsChanged() {
        if (!this._playerInstance) {
            return;
        }

        this._playerInstance.colors = parseColors(this.colors) || null;
    }

    /**
     * The 'stroke' attribute has been changed. Notify the player about the new value.
     */
    protected strokeChanged() {
        if (!this._playerInstance) {
            return;
        }

        this._playerInstance.stroke = parseStroke(this.stroke) || null;
    }

    /**
     * The 'state' attribute has been changed. Notify the player about the new value.
     */
    protected stateChanged() {
        if (!this._playerInstance) {
            return;
        }

        this._playerInstance.state = this.state;
    }

    /**
     * The 'icon' attribute has been changed. Reload our player.
     */
    protected iconChanged() {
        if (!this._isConnected) {
            return;
        }

        this.destroyPlayer();
        this.createPlayer();
    }

    /**
     * The 'src' attribute has been changed. Reload our player.
     */
    protected srcChanged() {
        if (!this._isConnected) {
            return;
        }

        this.destroyPlayer();
        this.createPlayer();
    }

    /**
     * Update the current icon. You can assign either an icon name handled by the {@link interfaces.IconLoader | icon loader} or directly use {@link interfaces.IconData | icon data}.
     */
    set icon(value: IconData | string | undefined) {
        if (value && isObjectLike(value)) {
            if (this._assignedIconData !== value) {
                this._assignedIconData = value;

                if (this.hasAttribute('icon')) {
                    this.removeAttribute('icon');
                } else {
                    this.iconChanged();
                }
            }
        } else {
            const oldIconData = this._assignedIconData;
            this._assignedIconData = undefined;

            if (value && typeof value === 'string') {
                this.setAttribute('icon', value);
            } else {
                this.removeAttribute('icon');

                if (oldIconData) {
                    this.iconChanged();
                }
            }
        }
    }

    /**
     * Get the icon (icon name or assiged {@link interfaces.IconData | icon data})
     */
    get icon(): IconData | string | undefined {
        return this._assignedIconData || this.getAttribute('icon');
    }

    /**
     * Set the 'src' value.
     */
    set src(value: string | null) {
        if (value) {
            this.setAttribute('src', value);
        } else {
            this.removeAttribute('src');
        }
    }

    /**
     * Get the 'src' value.
     */
    get src(): string | null {
        return this.getAttribute('src');
    }

    /**
     * Set the 'state' value. 
     * 
     * Note: You can check available states for the loaded icon using the `states` property.
     */
    set state(value: string | null) {
        if (value) {
            this.setAttribute('state', value);
        } else {
            this.removeAttribute('state');
        }
    }

    /**
     * Get the 'state' value.
     */
    get state(): string | null {
        return this.getAttribute('state');
    }

    /**
     * Configure color values. We support a string format with comma-separated colors: "primary:#fdd394,secondary:#03a9f4".
     * 
     * Example:
     * ```html
     * <lord-icon colors="primary:#fdd394,secondary:#03a9f4" src="/icons/confetti.json"></lord-icon>
     * ```
     */
    set colors(value: string | null) {
        if (value) {
            this.setAttribute('colors', value);
        } else {
            this.removeAttribute('colors');
        }
    }

    /**
     * Get the 'colors' value.
     */
    get colors(): string | null {
        return this.getAttribute('colors');
    }

    /**
     * Set the 'trigger' value. Provide the name of an already defined trigger.
     */
    set trigger(value: string | null) {
        if (value) {
            this.setAttribute('trigger', value);
        } else {
            this.removeAttribute('trigger');
        }
    }

    /**
     * Get the 'trigger' value.
     */
    get trigger(): string | null {
        return this.getAttribute('trigger');
    }

    /**
     * Set the loading strategy. By default, {@link interfaces.IconData | icon data} is loaded instantly upon {@link interfaces.IPlayer | player} initialization. 
     * It's possible to delay icon loading (using the _src_ and _icon_ attributes) by changing the _loading_ value to _lazy_ or _interaction_.
     */
    set loading(value: LoadingType | null) {
        if (value) {
            this.setAttribute('loading', value);
        } else {
            this.removeAttribute('loading');
        }
    }

    /**
     * Get the 'loading' value.
     */
    get loading(): LoadingType | null {
        if (this.getAttribute('loading')) {
            const param = this.getAttribute('loading')!.toLowerCase();
            if (param === 'lazy') {
                return 'lazy';
            } else if (param === 'interaction') {
                return 'interaction';
            }
        }

        return null;
    }

    /**
     * Assign a query selector for the closest element target used for listening to events.
     */
    set target(value: string | null) {
        if (value) {
            this.setAttribute('target', value);
        } else {
            this.removeAttribute('target');
        }
    }

    /**
     * Get the 'target' value.
     */
    get target(): string | null {
        return this.getAttribute('target');
    }

    /**
     * Set the 'stroke' value (1, 2, 3, light, regular, bold).
     */
    set stroke(value: string | null) {
        if (value) {
            this.setAttribute('stroke', value);
        } else {
            this.removeAttribute('stroke');
        }
    }

    /**
     * Get the 'stroke' value.
     */
    get stroke(): string | null {
        if (this.hasAttribute('stroke')) {
            return this.getAttribute('stroke');
        }
        return null;
    }

    /**
     * Check whether the element is ready (has an instantiated player, trigger, and loaded icon data).
     * 
     * You can listen for the element's readiness with an event listener:
     * ```js
     * element.addEventListener('ready', () => {});
     * ```
     */
    get isReady() {
        return this._isReady;
    }

    /**
     * Access the {@link interfaces.IPlayer | player} instance.
     */
    get playerInstance(): P | undefined {
        return this._playerInstance as any;
    }

    /**
     * Access the {@link interfaces.ITrigger | trigger} instance.
     */
    get triggerInstance(): ITrigger | undefined {
        return this._triggerInstance;
    }

    /**
     * Access the animation container element.
     */
    protected get animationContainer(): HTMLElement | undefined {
        return this._root!.lastElementChild as any;
    }

    /**
     * Access the loaded {@link interfaces.IconData | icon data}.
     */
    protected get iconData(): IconData | undefined {
        return this._assignedIconData || this._loadedIconData;
    }
}
