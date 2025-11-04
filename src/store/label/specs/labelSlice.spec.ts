import reducer from '../labelSlice';

describe('labelSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '__TEST__' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
