/**
 * This module defines types and enums related to bot detection.
 * It includes types for representing the detection result, bot kinds,
 * component states, and interfaces for bot detectors.
 * 
 * Key Types and Enums:
 * - BotDetectionResult: Represents the outcome of a bot detection,
 *   indicating whether a bot was detected and its kind.
 * - State: Enum for the source state, indicating success or various error states.
 * - BotKind: Enum for different types of bots and automation technologies.
 * - Component: Represents a component with a state and value.
 * - DetectorResponse: Defines the possible responses from a detector.
 * - BotDetectorInterface: Interface for classes that implement bot detection.
 * - BotdError: Custom error class for handling bot detection errors.
 */

export type BotDetectionResult =
  | {
      bot: true
      botKind: BotKind
    }
  | {
      bot: false
      botkind: 'unknown'
    }

/**
 * Enum for the source state.
 *
 * @readonly
 * @enum {number}
 */
export const enum State {
  Success = 0,
  Undefined = -1,
  NotFunction = -2,
  UnexpectedBehaviour = -3,
  Null = -4,
}

/**
 * Enum for types of bots.
 * Specific types of bots come first, followed by automation technologies.
 *
 * @readonly
 * @enum {string}
 */
export const BotKind = {
  Awesomium: 'awesomium',
  Cef: 'cef',
  CefSharp: 'cefsharp',
  CoachJS: 'coachjs',
  Electron: 'electron',
  FMiner: 'fminer',
  Geb: 'geb',
  NightmareJS: 'nightmarejs',
  Phantomas: 'phantomas',
  PhantomJS: 'phantomjs',
  Rhino: 'rhino',
  Selenium: 'selenium',
  Sequentum: 'sequentum',
  SlimerJS: 'slimerjs',
  WebDriverIO: 'webdriverio',
  WebDriver: 'webdriver',
  HeadlessChrome: 'headless_chrome',
  UndetectedChromedriver: 'undetected_chromedriver',
  SeleniumStealth: 'selenium_stealth',
  Puppeteer: 'puppeteer',
  PuppeteerExtra: 'puppeteer_extra',
  Playwright: 'playwright',
  SecretAgent: 'secret_agent',
  Unknown: 'unknown',
} as const;

export type BotKind = typeof BotKind[keyof typeof BotKind]

export type DetectorResponse = boolean | BotKind | undefined

/**
 * Represents a component with state and value.
 */
export type Component<T> =
  | {
      state: State.Success
      value: T
    }
  | {
      state: Exclude<State, State.Success>
      error: string
    }

/**
 * Represents a single source response type.
 */
export type SourceResponse<T> = T extends (...args: any[]) => any ? Awaited<ReturnType<T>> : T

export type AbstractDetector<T> = (components: T) => DetectorResponse

export type AbstractDetectorDict<T> = Record<string, AbstractDetector<T>>

export type AbstractSourceDict = Record<string, SourceResponse<any>>

export type AbstractComponentDict = Record<string, Component<any>>

export type AbstractDetectionsDict = Record<string, BotDetectionResult>

/**
 * Represents a dictionary of detectors detection.
 */
export type DetectionDict = Record<string, BotDetectionResult>

/**
 * Dictionary of components.
 */
export type ComponentDict<T extends AbstractSourceDict = AbstractSourceDict> = {
  [K in keyof T]: Component<SourceResponse<T[K]>>
}

/**
 * Interface for classes that represent a bot detector.
 *
 * @interface BotDetectorInterface
 */
export interface BotDetectorInterface {
  detect(): BotDetectionResult
  collect(): Promise<AbstractComponentDict>
  getComponents(): AbstractComponentDict | undefined
  getDetections(): AbstractDetectionsDict | undefined
}

/**
 * Bot detection error.
 */
export class BotdError extends Error {
  state: Exclude<State, State.Success>

  constructor(state: Exclude<State, State.Success>, message: string) {
    super(message)
    this.state = state
    this.name = 'BotdError'
    Object.setPrototypeOf(this, BotdError.prototype)
  }
}

export const enum BrowserEngineKind {
  Unknown = 'unknown',
  Chromium = 'chromium',
  Gecko = 'gecko',
  Webkit = 'webkit',
}

export const enum BrowserKind {
  Unknown = 'unknown',
  Chrome = 'chrome',
  Firefox = 'firefox',
  Opera = 'opera',
  Safari = 'safari',
  IE = 'internet_explorer',
  WeChat = 'wechat',
  Edge = 'edge',
}


