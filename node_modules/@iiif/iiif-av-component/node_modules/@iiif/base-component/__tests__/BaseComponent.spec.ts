// _Constructor is set within the file itself, hence nothing is imported
import '../src/BaseComponent';

describe('ExtendedBaseComponent', () => {
  class ExtendedBaseComponent extends _Components.BaseComponent {

    constructor(options: IBaseComponentOptions) {
      this.options = options;
    }

    public init(): boolean {
      return this._init();
    }

    public resize(): void {
      return this._resize();
    }
  }

  describe('#_init', () => {

    const emptyTarget = jest.fn();

    const targetElement = jest.fn<HTMLElement>({
      empty: emptyTarget
    });

    const options = jest.fn<IBaseComponentOptions>(() => {
      target: targetElement
    });

    const component = new ExtendedBaseComponent(options);
    it('empties the element if it exists', () => {

      const emptyHandler = jest.fn();
      const MockJQueryStatic = jest.fn();
      MockJQueryStatic.mockReturnValue({ length: 1, empty: emptyHandler });
      global.$ = MockJQueryStatic;

      const output = component.init();
      expect(output).toEqual(true);
      expect(emptyHandler).toHaveBeenCalled();
    });

    it('returns false if the element does not exist', () => {

      const MockJQueryStatic = jest.fn();
      MockJQueryStatic.mockReturnValue({ length: 0 });
      global.$ = MockJQueryStatic;

      const output = component.init();
      expect(output).toEqual(false);
    });
  });
});

describe('BaseComponent', () => {

  const MockJQueryStatic = jest.fn<JQueryStatic>(() => ({
    extend: jest.fn()
  }));

  global.$ = new MockJQueryStatic();

  const MockJQueryElement = jest.fn<JQuery>();
  const MockOptions = jest.fn<IBaseComponentOptions>();

  const options = new MockOptions();
  const component = new _Components.BaseComponent(options);
  describe('constructor', () => {

    it('constructs an object using options', () => {

      expect(component.options).not.toBeNull();
      expect(component.options.target).not.toBeNull();
    });
  });

  describe('#data', () => {

    it('constructs an object using options', () => {

      expect(component.data()).toEqual({});
    });
  });

  describe('#on', () => {

    it('binds a callback to an event', () => {

      const handler = jest.fn();
      component.on('myEvent', handler, this);
      expect(component._e).toHaveProperty('myEvent', [ { fn: handler, ctx: this } ]);
    });
  });

  describe('#fire', () => {

    it('invokes the callback bound to an event', () => {

      const handler = jest.fn();
      component.on('myEvent', handler, this);
      component.fire('myEvent', 'foo', 'bar');
      expect(handler).toHaveBeenCalledWith('foo', 'bar');
    });
  });

  describe('#set', () => {

    it('performs a noop', () => {

      expect(component.set({})).toBeUndefined();
    });
  });
});
