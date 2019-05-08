import '../src/BaseComponent';

describe('IBaseComponent', () => {

  class MyBaseComponent implements IBaseComponent {

    options: IBaseComponentOptions;

    constructor(options: IBaseComponentOptions) {
      this.options = options;
    }

    public data(): Object {
      return {};
    }

    public on(name: string, callback: Function, ctx: any): void {
      {};
    }

    public fire(name: string, ...args: any[]): void {
      {};
    }

    public set(data: Object): void {
      {};
    }
  }

  describe('MyBaseComponent', () => {

    const options = jest.fn<IBaseComponentOptions>();
    const component = new MyBaseComponent(options);

    describe('#data', () => {

      it('exposes a method for retrieving data', () => {

        expect(component.data).toBeDefined();
      });
    });

    describe('#on', () => {

      it('exposes a method for binding callbacks to events', () => {

        expect(component.on).toBeDefined();
      });
    });

    describe('#fire', () => {

      it('exposes a method for invoking callbacks bound to events', () => {

        expect(component.fire).toBeDefined();
      });
    });

    describe('#options', () => {

      it('exposes an accessor for the options property', () => {

        expect(component.options).toBeDefined();
      });
    });

    describe('#set', () => {

      it('exposes a mutator method for setting the data', () => {

        expect(component.set).toBeDefined();
      });
    });
  });
});
