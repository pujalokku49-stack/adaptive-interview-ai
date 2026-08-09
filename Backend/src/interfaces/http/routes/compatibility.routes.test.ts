import { compatibilityRouter } from './compatibility.routes';

// Let's test the compatibility routes by extracting the handlers and running them.
describe('compatibilityRouter', () => {

  it('exposes the expected routes in the router stack', () => {
    const paths = compatibilityRouter.stack.map((layer) => layer.route?.path).filter(Boolean);
    expect(paths).toContain('/interview/start');
    expect(paths).toContain('/interview/answer');
    expect(paths).toContain('/interview/state');
    expect(paths).toContain('/interview/state/:sessionId');
    expect(paths).toContain('/interview/feedback');
    expect(paths).toContain('/interview/feedback/:sessionId');
    expect(paths).toContain('/candidate/:id');
    expect(paths).toContain('/curriculum');
  });
});
