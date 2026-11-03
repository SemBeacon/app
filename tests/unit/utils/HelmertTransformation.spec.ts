import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { Coordinate } from 'ol/coordinate';
import { HelmertTransformation } from '@/utils/HelmertTransformation';

const coordinate = fc.tuple(
    fc.double({ min: -1e4, max: 1e4, noNaN: true }),
    fc.double({ min: -1e4, max: 1e4, noNaN: true }),
);

/** Apply a known similarity transform (rotation, uniform scale, translation). */
function similarity(angle: number, scale: number, tx: number, ty: number) {
    return ([x, y]: Coordinate): Coordinate => [
        scale * (Math.cos(angle) * x - Math.sin(angle) * y) + tx,
        scale * (Math.sin(angle) * x + Math.cos(angle) * y) + ty,
    ];
}

const controlPoints: Coordinate[] = [
    [0, 0],
    [100, 0],
    [100, 50],
    [0, 50],
];

describe('HelmertTransformation', () => {
    it('is the identity without control points', () => {
        const helmert = new HelmertTransformation();
        expect(helmert.transform([12, -3])).toEqual([12, -3]);
        expect(helmert.setControlPoints([[0, 0]], [[1, 1]])).toBe(false);
    });

    it('recovers rotation, scale and translation of a similarity transform', () => {
        const target = similarity(Math.PI / 6, 2, 10, -5);
        const helmert = new HelmertTransformation({ similarity: true });
        expect(helmert.setControlPoints(controlPoints, controlPoints.map(target))).toBe(true);

        // Counter-clockwise input angle, reported clockwise (OpenLayers convention)
        expect(helmert.getRotation()).toBeCloseTo(-Math.PI / 6);
        expect(helmert.getScale()[0]).toBeCloseTo(2);
        expect(helmert.getScale()[1]).toBeCloseTo(2);
        expect(helmert.getTranslation()[0]).toBeCloseTo(10);
        expect(helmert.getTranslation()[1]).toBeCloseTo(-5);
    });

    it.each([
        ['similarity', true],
        ['helmert', false],
    ])('reverse(transform(p)) ≈ p (%s)', (_name, useSimilarity) => {
        const helmert = new HelmertTransformation({ similarity: useSimilarity });
        helmert.setControlPoints(controlPoints, controlPoints.map(similarity(0.4, 1.5, 3, 7)));
        fc.assert(
            fc.property(coordinate, (p) => {
                const [x, y] = helmert.reverse(helmert.transform(p));
                expect(x).toBeCloseTo(p[0], 4);
                expect(y).toBeCloseTo(p[1], 4);
            }),
        );
    });

    it('keeps the identity when the point arrays have different lengths', () => {
        const helmert = new HelmertTransformation({ similarity: true });
        expect(helmert.setControlPoints(controlPoints, controlPoints.slice(1))).toBe(false);
        expect(helmert.transform([4, 2])).toEqual([4, 2]);
    });
});
