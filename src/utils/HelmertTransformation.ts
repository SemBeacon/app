import type { Coordinate } from 'ol/coordinate';

/**
 * Result of a Helmert transformation containing translation, scale, and rotation information.
 */
export interface HelmertTransformationResult {
    translation: Coordinate;
    scale: Coordinate;
    rotation: number; // Angle in radians
}

/**
 * Class representing Helmert Transformation.
 *
 * @see {@link https://github.com/Viglino/Map-georeferencer/blob/gh-pages/helmerttransform.js}
 */
export class HelmertTransformation {
    private similarity: boolean;
    private matrix: number[] | false;
    private hasControlPoints: boolean;
    private a_: number;
    private sc_: Coordinate;
    private tr_: Coordinate;

    /**
     * Creates an instance of HelmertTransformation.
     * @param {Object} options - Options for the Helmert transformation.
     * @param {boolean} options.similarity - If true, uses similarity transformation.
     */
    constructor(options?: { similarity?: boolean }) {
        if (!options) options = {};
        this.similarity = options.similarity;
        this.matrix = [1, 0, 0, 0, 1, 0];
        this.hasControlPoints = false;
        this.a_ = 0;
        this.sc_ = [0, 0];
        this.tr_ = [0, 0];
    }

    /**
     * Set control points for the transformation.
     * @param {Coordinate[]} xy - Source coordinates.
     * @param {Coordinate[]} XY - Target coordinates.
     * @returns {boolean} - True if control points are set successfully.
     */
    setControlPoints(xy: Coordinate[], XY: Coordinate[]): boolean {
        if (xy.length < 2) {
            this.matrix = [1, 0, 0, 0, 1, 0];
            this.hasControlPoints = false;
        } else {
            if (this.similarity || xy.length < 3) this.matrix = this._similarity(xy, XY);
            else this.matrix = this._helmert(xy, XY);
            this.hasControlPoints = true;
        }
        return this.hasControlPoints;
    }

    /**
     * Get the rotation angle of the transformation.
     * @returns {number} - Rotation angle in radians.
     */
    getRotation(): number {
        return this.a_;
    }

    /**
     * Get the scale along x and y axis of the transformation.
     * @returns {Coordinate} - Scale along x and y axis.
     */
    getScale(): Coordinate {
        return this.sc_;
    }

    /**
     * Get the translation vector of the transformation.
     * @returns {Coordinate} - Translation vector.
     */
    getTranslation(): Coordinate {
        return this.tr_;
    }

    /**
     * Transform a point from source to target coordinates.
     * @param {Coordinate} xy - Source coordinate.
     * @returns {Coordinate} - Transformed coordinate.
     */
    transform(xy: Coordinate): Coordinate {
        const m = this.matrix;
        return [m[0] * xy[0] + m[1] * xy[1] + m[2], m[3] * xy[0] + m[4] * xy[1] + m[5]];
    }

    /**
     * Reverse transform a point from target to source coordinates.
     * @param {Coordinate} xy - Target coordinate.
     * @returns {Coordinate} - Reverse transformed coordinate.
     */
    reverse(xy: Coordinate): Coordinate {
        const a = this.matrix[0];
        const b = this.matrix[1];
        const c = this.matrix[3];
        const d = this.matrix[4];
        const p = this.matrix[2];
        const q = this.matrix[5];
        return [
            (d * xy[0] - b * xy[1] + b * q - p * d) / (a * d - b * c),
            (-c * xy[0] + a * xy[1] + c * p - a * q) / (a * d - b * c),
        ];
    }

    /**
     * Perform similarity transformation using least squares.
     * @param {Coordinate[]} xy - Source coordinates.
     * @param {Coordinate[]} XY - Target coordinates.
     * @returns {number[] | false} - Transformation matrix or false if incompatible sizes.
     * @private
     */
    private _similarity(xy: Coordinate[], XY: Coordinate[]): number[] | false {
        if (!xy.length || xy.length !== XY.length) {
            console.log('Helmert: Size of point arrays is incompatible');
            return false;
        }

        const n = XY.length;
        let a = 1,
            b = 0,
            p = 0,
            q = 0;

        const mxy = { x: 0, y: 0 };
        const mXY = { x: 0, y: 0 };

        for (let i = 0; i < n; i++) {
            mxy.x += xy[i][0];
            mxy.y += xy[i][1];
            mXY.x += XY[i][0];
            mXY.y += XY[i][1];
        }

        mxy.x /= n;
        mxy.y /= n;
        mXY.x /= n;
        mXY.y /= n;

        const xy0: Coordinate[] = [];
        const XY0: Coordinate[] = [];

        for (let i = 0; i < n; i++) {
            xy0.push([xy[i][0] - mxy.x, xy[i][1] - mxy.y]);
            XY0.push([XY[i][0] - mXY.x, XY[i][1] - mXY.y]);
        }

        let SxX = 0,
            SxY = 0,
            SyY = 0,
            SyX = 0,
            Sx2 = 0,
            Sy2 = 0;

        for (let i = 0; i < n; i++) {
            SxX += xy0[i][0] * XY0[i][0];
            SxY += xy0[i][0] * XY0[i][1];
            SyY += xy0[i][1] * XY0[i][1];
            SyX += xy0[i][1] * XY0[i][0];
            Sx2 += xy0[i][0] * xy0[i][0];
            Sy2 += xy0[i][1] * xy0[i][1];
        }

        a = (SxX + SyY) / (Sx2 + Sy2);
        b = (SxY - SyX) / (Sx2 + Sy2);
        p = mXY.x - a * mxy.x + b * mxy.y;
        q = mXY.y - b * mxy.x - a * mxy.y;

        this.matrix = [a, -b, p, b, a, q];

        const sc = Math.sqrt(a * a + b * b);
        this.a_ = Math.acos(a / sc);
        if (b > 0) this.a_ *= -1;
        this.sc_ = [sc, sc];
        this.tr_ = [p, q];

        return this.matrix;
    }

    /**
     * Perform Helmert transformation using least squares.
     * @param {Coordinate[]} xy - Source coordinates.
     * @param {Coordinate[]} XY - Target coordinates.
     * @param {number[]} poids - Weights for the points.
     * @param {number} tol - Tolerance for iteration.
     * @returns {number[] | false} - Transformation matrix or false if incompatible sizes.
     * @private
     */
    private _helmert(
        xy: Coordinate[],
        XY: Coordinate[],
        poids?: number[],
        tol?: number,
    ): number[] | false {
        if (!xy.length || xy.length !== XY.length) {
            console.log('Helmert: Size of point arrays is incompatible');
            return false;
        }

        const n = XY.length;

        if (!poids) poids = [];
        if (poids.length === 0 || n !== poids.length) {
            for (let i = 0; i < n; i++) poids.push(1.0);
        }

        let a,
            b,
            k,
            h,
            tx,
            ty = 0;

        if (!tol) tol = 0.0001;

        const affine = this._similarity(xy, XY);
        a = affine[0];
        b = -affine[1];
        k = h = Math.sqrt(a * a + b * b);
        a /= k;
        b /= k;
        tx = affine[2];
        ty = affine[5];

        const mxy = { x: 0, y: 0 };
        const mXY = { x: 0, y: 0 };

        for (let i = 0; i < n; i++) {
            mxy.x += xy[i][0];
            mxy.y += xy[i][1];
            mXY.x += XY[i][0];
            mXY.y += XY[i][1];
        }

        mxy.x /= n;
        mxy.y /= n;
        mXY.x /= n;
        mXY.y /= n;

        const xy0: Coordinate[] = [];
        const XY0: Coordinate[] = [];

        for (let i = 0; i < n; i++) {
            xy0.push([xy[i][0] - mxy.x, xy[i][1] - mxy.y]);
            XY0.push([XY[i][0] - mXY.x, XY[i][1] - mXY.y]);
        }

        let Sx = 0,
            Sy = 0,
            Sxy = 0,
            SxX = 0,
            SxY = 0,
            SyX = 0,
            SyY = 0;

        for (let i = 0; i < n; i++) {
            Sx += xy0[i][0] * xy0[i][0] * poids[i];
            Sxy += xy0[i][0] * xy0[i][1] * poids[i];
            Sy += xy0[i][1] * xy0[i][1] * poids[i];
            SxX += xy0[i][0] * XY0[i][0] * poids[i];
            SyX += xy0[i][1] * XY0[i][0] * poids[i];
            SxY += xy0[i][0] * XY0[i][1] * poids[i];
            SyY += xy0[i][1] * XY0[i][1] * poids[i];
        }

        let dk, dh, dt;
        let A, B, C, D, E, F, G, H;
        let da, db;
        let div = 1e10;

        do {
            A = Sx;
            B = Sy;
            C = k * k * Sx + h * h * Sy;
            D = -h * Sxy;
            E = k * Sxy;
            F = a * SxX + b * SxY - k * Sx;
            G = -b * SyX + a * SyY - h * Sy;
            H = -k * b * SxX + k * a * SxY - h * a * SyX - h * b * SyY;

            dt = (A * B * H - B * D * F - A * E * G) / (A * B * C - B * D * D - A * E * E);
            dk = (F - D * dt) / A;
            dh = (G - E * dt) / A;

            if (Math.abs(dk) + Math.abs(dh) > div) break;

            da = a * Math.cos(dt) - b * Math.sin(dt);
            db = b * Math.cos(dt) + a * Math.sin(dt);
            a = da;
            b = db;
            k += dk;
            h += dh;

            div = Math.abs(dk) + Math.abs(dh);
        } while (Math.abs(dk) + Math.abs(dh) > tol);

        tx = mXY.x - a * k * mxy.x + b * h * mxy.y;
        ty = mXY.y - b * k * mxy.x - a * h * mxy.y;

        this.a_ = Math.acos(a);
        if (b > 0) this.a_ *= -1;
        if (Math.abs(this.a_) < Math.PI / 8) {
            this.a_ = Math.asin(-b);
            if (a < 0) this.a_ = Math.PI - this.a_;
        }

        this.sc_ = [k, h];
        this.tr_ = [tx, ty];

        this.matrix = [a * k, -b * h, tx, b * k, a * h, ty];

        return this.matrix;
    }
}
