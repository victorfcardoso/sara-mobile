import reducer from '../macroSlice';

describe('macroSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '__TEST__' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
