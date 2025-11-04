import reducer from '../inboxSlice';

describe('inbox reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '__TEST__' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
