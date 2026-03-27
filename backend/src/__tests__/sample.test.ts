describe('Sample Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify app is running', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
