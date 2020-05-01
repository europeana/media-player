import axe from 'axe-core';

describe('Accessibility', () => {

  console.log('XXXXXXXXXXXXXXXXXXXXXXXXXX')

  it('should be accessible', (done) => {

    console.log('sssssssss')

    axe.run(function(err, result) {


      console.log('ppppppppppppppp')

      console.log(JSON.stringify(result.violations));

			expect(err).toBe(null);
			expect(result.violations.length).toBe(0);

			done();
		});

  });
});
