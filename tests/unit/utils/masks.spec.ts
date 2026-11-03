import { describe, expect, it } from 'vitest';
import { maskitoTransform } from '@maskito/core';
import { hexMask, uuidMask } from '@/utils/masks';

describe('input masks', () => {
    it('keeps only the allowed number of hexadecimal characters', () => {
        expect(maskitoTransform('c187d748ff', hexMask(8))).toBe('c187d748');
        expect(maskitoTransform('zz12', hexMask(8))).toBe('12');
    });

    it('formats a UUID with dashes', () => {
        expect(maskitoTransform('77f340dbac0d20e8aa3af656a29f236c', uuidMask())).toBe(
            '77f340db-ac0d-20e8-aa3a-f656a29f236c',
        );
    });
});
