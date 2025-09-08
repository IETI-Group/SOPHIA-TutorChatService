import { describe, expect, it } from 'vitest';
import { fibo } from '../src/server.js';

describe('Fibonacci function', () => {
  it('should return the correct Fibonacci number for a given input', () => {
    expect(fibo(0)).toBe(0);
    expect(fibo(1)).toBe(1);
    expect(fibo(2)).toBe(1);
    expect(fibo(3)).toBe(2);
    expect(fibo(4)).toBe(3);
    expect(fibo(5)).toBe(5);
    expect(fibo(6)).toBe(8);
    expect(fibo(7)).toBe(13);
    expect(fibo(8)).toBe(21);
    expect(fibo(9)).toBe(34);
    expect(fibo(10)).toBe(55);
  });
});
