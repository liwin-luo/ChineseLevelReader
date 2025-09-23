import { countCharacters, countSentences, createSuccessResponse, createErrorResponse } from '@/utils/api';

describe('utils/api', () => {
  test('countCharacters counts Chinese characters', () => {
    expect(countCharacters('你好，世界！')).toBe(4);
    expect(countCharacters('Hello 世界')).toBe(2);
  });

  test('countSentences splits by Chinese punctuation', () => {
    expect(countSentences('这是第一句。这里是第二句！还有第三句？')).toBe(3);
  });

  test('createSuccessResponse returns success payload', () => {
    const res = createSuccessResponse({ ok: true }, 'done');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ ok: true });
    expect(res.message).toBe('done');
  });

  test('createErrorResponse returns error payload', () => {
    const res = createErrorResponse('bad');
    expect(res.success).toBe(false);
    expect(res.error).toBe('bad');
  });
});


