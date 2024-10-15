import {
    AbstractDetectorDict,
    AbstractSourceDict,
    BotdError,
    BotDetectionResult,
    BotKind,
    Component,
    ComponentDict,
    DetectionDict,
    State,
} from './types'

export function detect<T extends ComponentDict, K extends AbstractDetectorDict<T>>(
    components: T,
    detectors: K,
): [Record<keyof K, BotDetectionResult>, BotDetectionResult] { // Change DetectionDict to a Record
    const detections = {} as Record<keyof K, BotDetectionResult> // Update the type here
    let finalDetection: BotDetectionResult = {
        bot: false,
        botkind: BotKind.Unknown
    }

    for (const detectorName in detectors) {
        const detector = detectors[detectorName as keyof K] // Use keyof K here
        const detectorRes = detector(components)

        let detection: BotDetectionResult = { bot: false , botkind: BotKind.Unknown}

        if (typeof detectorRes === 'string' && Object.values(BotKind).includes(detectorRes as BotKind)) {
            detection = { bot: true, botKind: detectorRes as BotKind }
        } else if (detectorRes) {
            detection = { bot: true, botKind: BotKind.Unknown }
        }

        detections[detectorName as keyof K] = detection // Indexing detections correctly

        if (detection.bot) {
            finalDetection = detection
        }
    }

    return [detections, finalDetection]
}


export async function collect<T extends AbstractSourceDict>(sources: T): Promise<ComponentDict<T>> {
    const components = {} as ComponentDict<T>
    const sourcesKeys = Object.keys(sources) as (keyof typeof sources)[]

    await Promise.all(
        sourcesKeys.map(async (sourceKey) => {
            const res = sources[sourceKey]

            try {
                components[sourceKey] = ({
                    value: await res(),
                    state: State.Success,
                } as Component<any>) as any
            } catch (error) {
                if (error instanceof BotdError) {
                    components[sourceKey] = {
                        state: error.state,
                        error: `${error.name}: ${error.message}`,
                    }
                } else {
                    components[sourceKey] = {
                        state: State.UnexpectedBehaviour,
                        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
                    }
                }
            }
        }),
    )

    return components
}
