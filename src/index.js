/**
 * Build styles
 */
require("./index.css").toString();

/**
 * Base Paragraph Block for the Editor.js.
 * Represents simple paragraph
 *
 * @author CodeX (team@codex.so)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 */

/**
 * @typedef {object} ParagraphConfig
 * @property {string} placeholder - placeholder for the empty paragraph
 * @property {boolean} preserveBlank - Whether or not to keep blank paragraphs when saving editor data
 */

/**
 * @typedef {Object} ParagraphData
 * @description Tool's input and output data format
 * @property {String} text — Paragraph's content. Can include HTML tags: <a><b><i>
 */
class Paragraph {
    /**
     * Default placeholder for Paragraph Tool
     *
     * @return {string}
     * @constructor
     */
    static get DEFAULT_PLACEHOLDER() {
        return "";
    }

    /**
     * Allowed paragraph alignments
     *
     * @public
     * @returns {{left: string, center: string, right: string}}
     */
    static get ALIGNMENTS() {
        return {
            left: "left",
            center: "center",
            right: "right",
        };
    }

    /**
     * Default paragraph alignment
     *
     * @public
     * @returns {string}
     */
    static get DEFAULT_ALIGNMENT() {
        return Paragraph.ALIGNMENTS.left;
    }

    /**
     * Tool`s settings properties
     *
     * @returns {*[]}
     */
    get settings() {
        return [
            {
                name: "left",
                icon: `<svg width="16" height="11" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg" ><path d="M1.069 0H13.33a1.069 1.069 0 0 1 0 2.138H1.07a1.069 1.069 0 1 1 0-2.138zm0 4.275H9.03a1.069 1.069 0 1 1 0 2.137H1.07a1.069 1.069 0 1 1 0-2.137zm0 4.275h9.812a1.069 1.069 0 0 1 0 2.137H1.07a1.069 1.069 0 0 1 0-2.137z" /></svg>`,
            },
            {
                name: "center",
                icon: `<svg width="16" height="11" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg" ><path d="M1.069 0H13.33a1.069 1.069 0 0 1 0 2.138H1.07a1.069 1.069 0 1 1 0-2.138zm3.15 4.275h5.962a1.069 1.069 0 0 1 0 2.137H4.22a1.069 1.069 0 1 1 0-2.137zM1.069 8.55H13.33a1.069 1.069 0 0 1 0 2.137H1.07a1.069 1.069 0 0 1 0-2.137z"/></svg>`,
            },
            {
                name: "right",
                icon: `<svg width="16" height="11" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg" ><path d="M1.069 0H13.33a1.069 1.069 0 0 1 0 2.138H1.07a1.069 1.069 0 1 1 0-2.138zm0 4.275H9.03a1.069 1.069 0 1 1 0 2.137H1.07a1.069 1.069 0 1 1 0-2.137zm0 4.275h9.812a1.069 1.069 0 0 1 0 2.137H1.07a1.069 1.069 0 0 1 0-2.137z" transform="scale(-1,1) translate(-16,0)" /></svg>`,
            },
        ];
    }

    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {object} params - constructor params
     * @param {ParagraphData} params.data - previously saved data
     * @param {ParagraphConfig} params.config - user config for Tool
     * @param {object} params.api - editor.js api
     */
    constructor({ data, config, api }) {
        const { ALIGNMENTS, DEFAULT_ALIGNMENT } = Paragraph;

        this.api = api;

        this._CSS = {
            block: this.api.styles.block,
            wrapper: "ce-paragraph",
            settingsWrapper: "cdx-paragraph-settings",
            settingsButton: this.api.styles.settingsButton,
            settingsButtonActive: this.api.styles.settingsButtonActive,
        };
        this.onKeyUp = this.onKeyUp.bind(this);

        /**
         * Placeholder for paragraph if it is first Block
         * @type {string}
         */
        this._placeholder = config.placeholder
            ? config.placeholder
            : Paragraph.DEFAULT_PLACEHOLDER;
        this._data = {};
        this._element = this.drawView();
        this._preserveBlank =
            config.preserveBlank !== undefined ? config.preserveBlank : false;

        this.data = {
            text: data.text || "",
            alignment:
                (Object.values(ALIGNMENTS).includes(data.alignment) &&
                    data.alignment) ||
                config.defaultAlignment ||
                DEFAULT_ALIGNMENT,
        };
    }

    /**
     * Check if text content is empty and set empty string to inner html.
     * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
     *
     * @param {KeyboardEvent} e - key up event
     */
    onKeyUp(e) {
        if (e.code !== "Backspace" && e.code !== "Delete") {
            return;
        }

        const { textContent } = this._element;

        if (textContent === "") {
            this._element.innerHTML = "";
        }
    }

    /**
     * Create Tool's view
     * @return {HTMLElement}
     * @private
     */
    drawView() {
        let div = document.createElement("DIV");

        div.classList.add(this._CSS.wrapper, this._CSS.block);
        div.contentEditable = true;
        div.dataset.placeholder = this.api.i18n.t(this._placeholder);

        div.addEventListener("keyup", this.onKeyUp);

        return div;
    }

    /**
     * Return Tool's view
     * @returns {HTMLDivElement}
     * @public
     */
    render() {
        return this._element;
    }

    /**
     * Method that specified how to merge two Text blocks.
     * Called by Editor.js by backspace at the beginning of the Block
     * @param {ParagraphData} data
     * @public
     */
    merge(data) {
        let newData = {
            text: this.data.text + data.text,
        };

        this.data = Object.assign(this.data, newData);
    }

    /**
     * Validate Paragraph block data:
     * - check for emptiness
     *
     * @param {ParagraphData} savedData — data received after saving
     * @returns {boolean} false if saved data is not correct, otherwise true
     * @public
     */
    validate(savedData) {
        if (savedData.text.trim() === "" && !this._preserveBlank) {
            return false;
        }

        return true;
    }

    /**
     * Extract Tool's data from the view
     * @param {HTMLDivElement} toolsContent - Paragraph tools rendered view
     * @returns {ParagraphData} - saved data
     * @public
     */
    save(toolsContent) {
        return Object.assign(this.data, {
            text: toolsContent.innerHTML,
        });
    }

    /**
     * On paste callback fired from Editor.
     *
     * @param {PasteEvent} event - event with pasted data
     */
    onPaste(event) {
        const data = {
            text: event.detail.data.innerHTML,
        };

        this.data = Object.assign(this.data, data);
    }

    /**
     * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
     */
    static get conversionConfig() {
        return {
            export: "text", // to convert Paragraph to other block, use 'text' property of saved data
            import: "text", // to covert other block's exported string to Paragraph, fill 'text' property of tool data
        };
    }

    /**
     * Sanitizer rules
     */
    static get sanitize() {
        return {
            text: {
                br: true,
            },
            alignment: {},
        };
    }

    /**
     * Get current Tools`s data
     * @returns {ParagraphData} Current data
     * @private
     */
    get data() {
        let text = this._element.innerHTML;

        this._data.text = text;

        return this._data;
    }

    /**
     * Store data in plugin:
     * - at the this._data property
     * - at the HTML
     *
     * @param {ParagraphData} data — data to set
     * @private
     */
    set data(data) {
        this._data = data || {};

        this._element.innerHTML = this._data.text || "";
    }

    /**
     * Used by Editor paste handling API.
     * Provides configuration to handle P tags.
     *
     * @returns {{tags: string[]}}
     */
    static get pasteConfig() {
        return {
            tags: ["P"],
        };
    }

    /**
     * Icon and title for displaying at the Toolbox
     *
     * @return {{icon: string, title: string}}
     */
    static get toolbox() {
        return {
            icon: require("./toolbox-icon.svg").default,
            title: "Text",
        };
    }

    /**
     * Create wrapper for Tool`s settings buttons:
     * 1. Left alignment
     * 2. Center alignment
     *
     * @returns {HTMLDivElement}
     */
    renderSettings() {
        const wrapper = this._make("div", [this._CSS.settingsWrapper], {});
        const capitalize = (str) => str[0].toUpperCase() + str.substr(1);

        this.settings
            .map((tune) => {
                const el = this._make("div", this._CSS.settingsButton, {
                    innerHTML: tune.icon,
                    title: `${capitalize(tune.name)} alignment`,
                });

                el.classList.toggle(
                    this._CSS.settingsButtonActive,
                    tune.name === this.data.alignment
                );

                wrapper.appendChild(el);

                return el;
            })
            .forEach((element, index, elements) => {
                element.addEventListener("click", () => {
                    this._toggleTune(this.settings[index].name);

                    elements.forEach((el, i) => {
                        const { name } = this.settings[i];

                        el.classList.toggle(
                            this._CSS.settingsButtonActive,
                            name === this.data.alignment
                        );
                    });
                });
            });

        return wrapper;
    }

    /**
     * Toggle quote`s alignment
     *
     * @param {string} tune - alignment
     * @private
     */
    _toggleTune(tune) {
        this.data.alignment = tune;
        this.settings.forEach((tune) => {
            this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);
        });
    }

    /**
     * Helper for making Elements with attributes
     *
     * @param  {string} tagName           - new Element tag name
     * @param  {array|string} classNames  - list or name of CSS classname(s)
     * @param  {Object} attributes        - any attributes
     * @return {Element}
     */
    _make(tagName, classNames = null, attributes = {}) {
        let el = document.createElement(tagName);

        if (Array.isArray(classNames)) {
            el.classList.add(...classNames);
        } else if (classNames) {
            el.classList.add(classNames);
        }

        for (let attrName in attributes) {
            el[attrName] = attributes[attrName];
        }

        return el;
    }
}

module.exports = Paragraph;
