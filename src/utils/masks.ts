import type { MaskitoOptions } from '@maskito/core';

const HEX = /[a-fA-F0-9]/;

/** Ionic inputs render their native <input> asynchronously; Maskito needs that element. */
const ionInputElement = (el: HTMLElement): Promise<HTMLInputElement> =>
    new Promise((resolve) => {
        requestAnimationFrame(async () => {
            resolve(await (el as unknown as HTMLIonInputElement).getInputElement());
        });
    });

/** Input mask for a fixed number of hexadecimal characters (e.g. a 4-byte instance ID). */
export function hexMask(
    length: number,
): MaskitoOptions & { elementPredicate: typeof ionInputElement } {
    return {
        mask: Array(length).fill(HEX),
        elementPredicate: ionInputElement,
    };
}

/** Input mask for a 128-bit UUID (8-4-4-4-12 hexadecimal characters). */
export function uuidMask(): MaskitoOptions & { elementPredicate: typeof ionInputElement } {
    const group = (length: number) => Array(length).fill(HEX);
    return {
        mask: [
            ...group(8),
            '-',
            ...group(4),
            '-',
            ...group(4),
            '-',
            ...group(4),
            '-',
            ...group(12),
        ],
        elementPredicate: ionInputElement,
    };
}
