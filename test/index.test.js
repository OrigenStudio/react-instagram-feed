import { getInstagramFeedInfo } from '../src/index';

test('getInstagramInfo', () => {
  return getInstagramFeedInfo('origenstudio').then(data => {
    expect(data.accountName).toBe('origenstudio');
  });
});
