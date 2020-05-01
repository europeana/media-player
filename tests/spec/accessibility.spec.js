import axe from 'axe-core';

describe('Accessibility', () => {

  it('should be accessible', (done) => {
    axe.run(function(err, result) {
			expect(err).toBe(null);
			expect(result.violations.length).toBe(0);
			done();
		});
  });
});
